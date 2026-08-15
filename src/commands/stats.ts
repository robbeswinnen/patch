// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.
import { openPrefilledReportModal } from './report';
import { simpleErrorMessage, statsDashboardMessage } from '../lib/app-ui';
import { customId, parseCustomId } from '../lib/components-v2';
import {
	EMBED_COLOR,
	accountCreatedEstimate,
	currentSeason,
	displayName,
	fetchProfileByPlayerOption,
	fieldValue,
	formatBan,
	formatClanMembership,
	formatLastOnline,
	formatOptionalInteger,
	formatRank,
	kd,
	peakRankName,
	playerId,
	seasonByNumber,
	statField,
	sumStats,
	winRate,
} from '../lib/cops';
import {
	EPHEMERAL,
	PLAYER_OPTION,
	TEXT_INPUT_SHORT,
	USER_INSTALLABLE_CONTEXTS,
	deferredInteractionResponse,
	deferredUpdateMessageResponse,
	editOriginalInteractionResponse,
	interactionResponse,
	interactionUserId,
	labelComponent,
	modalResponse,
	optionValue,
	pageMenu,
	runInBackground,
	textInput,
	updateMessageResponse,
} from '../lib/discord';
import { recordProfileLookupSoon } from '../lib/lookup-counts';
import { publicStatusFor } from '../lib/player-tags';
import { embedImage, pageFooter, quoteList, section } from '../lib/presentation';
import { getOrRenderPlayerCardFromProfile } from '../lib/profile-card-cache';
import { sendProfileCardResponse } from '../lib/profile-card-response';
import { getAcceptedReport, getPlayerTagRecord } from '../lib/storage';
import { toggleTrackedProfile } from '../lib/tracking';

const STATS_PAGE_LABELS = ['Overview', 'Season', 'All-Time'];
const definition = {
	name: 'stats',
	description: "Read a player's public stats in clean pages.",
	type: 1,
	options: [
		{
			name: 'player',
			...PLAYER_OPTION,
		},
	],
	...USER_INSTALLABLE_CONTEXTS,
};
function statsMenu(profile, selectedIndex = 0) {
	const id = playerId(profile) || encodeURIComponent(displayName(profile)).slice(0, 48);
	return pageMenu(`stats_page:${id}`, STATS_PAGE_LABELS, selectedIndex);
}

function plainPlayerId(profile) {
	return playerId(profile) || 'Unknown';
}

function singleLineClan(profile) {
	return formatClanMembership(profile).replace(/\n/g, ' - ');
}

async function buildStatsEmbeds(profile, env) {
	const seasons = profile.stats?.seasonal_stats ?? [];
	const latestSeasonNumber = currentSeason(seasons);
	const latestSeasonStats = seasonByNumber(seasons, latestSeasonNumber);
	const name = displayName(profile);
	const targetPlayerId = playerId(profile);
	const [report, tagRecord] = await Promise.all([
		getAcceptedReport(env || {}, targetPlayerId),
		getPlayerTagRecord(env || {}, targetPlayerId),
	]);
	const status = publicStatusFor(report, tagRecord?.tags);
	const pages = STATS_PAGE_LABELS.length;
	const lastOnline = formatLastOnline(profile);
	const statusLines =
		status.kind === 'report'
			? ['Community status: **Report accepted**', `Public reason: **${status.reportReason}**`]
			: status.kind === 'tags'
				? [`Community status: **${status.label}**`, ...status.tags.map((tag) => `${tag.label}: ${tag.description}`)]
				: ['Community status: **Secure**', 'No accepted report or curated tag.'];
	const ranked = profile.stats?.ranked;
	const rankedStats = latestSeasonStats?.ranked;
	return [
		{
			title: `${name} overview`,
			color: status.kind === 'secure' ? EMBED_COLOR : status.embedColor,
			description: [
				'## Quick read',
				quoteList([
					`IGN: **${name}**`,
					`ID: \`${plainPlayerId(profile)}\``,
					lastOnline ? `Last online: **${lastOnline}**` : undefined,
					`Level: **${formatOptionalInteger(profile.basicInfo?.playerLevel?.level)}**`,
					`Clan: **${singleLineClan(profile)}**`,
				]),
			].join('\n'),
			image: embedImage('stats'),
			timestamp: /* @__PURE__ */ new Date().toISOString(),
			fields: [
				{
					name: 'Ranked now',
					value: fieldValue(
						quoteList([
							`Rank: **${formatRank(ranked).split('\n')[0].replace('Rank: ', '')}**`,
							`Peak: **${peakRankName(ranked) || 'Unknown'}**`,
							`MMR: **${formatOptionalInteger(ranked?.mmr)}**`,
							`Season K/D: **${kd(rankedStats)}**`,
							`Season win rate: **${winRate(rankedStats)}**`,
						]),
					),
					inline: true,
				},
				{
					name: 'Account',
					value: fieldValue(quoteList([accountCreatedEstimate(seasons), ...formatBan(profile.ban).split('\n')])),
					inline: true,
				},
				{
					name: 'Public status',
					value: fieldValue(section('Community read', quoteList(statusLines))),
					inline: false,
				},
			],
			footer: pageFooter(1, pages),
		},
		{
			title: `${name} season stats`,
			description: [
				'## Current season',
				quoteList([`Season: **${latestSeasonNumber ?? 'Unknown'}**`, 'Public mode stats, split out so the overview can breathe.']),
			].join('\n'),
			color: EMBED_COLOR,
			image: embedImage('stats'),
			fields: [
				statField('Ranked', latestSeasonStats?.ranked),
				statField('Casual', latestSeasonStats?.casual),
				statField('Custom', latestSeasonStats?.custom),
			],
			footer: pageFooter(2, pages),
		},
		{
			title: `${name} public history`,
			description: [
				'## All-time public totals',
				quoteList(['Totals are summed from public seasonal stats.', 'Good for trend checks; less useful for dramatic courtroom speeches.']),
			].join('\n'),
			color: EMBED_COLOR,
			image: embedImage('stats'),
			fields: [
				statField('Ranked', sumStats(seasons, 'ranked')),
				statField('Casual', sumStats(seasons, 'casual')),
				statField('Custom', sumStats(seasons, 'custom')),
			],
			footer: pageFooter(3, pages, 'public seasonal totals'),
		},
	];
}

async function handleStatsPage(interaction, env) {
	const customIdValue = interaction.data?.custom_id || '';
	const page = Number(interaction.data?.values?.[0] || 0);
	const lookup = customIdValue.replace('stats_page:', '');
	const profile = await fetchProfileByPlayerOption(decodeURIComponent(lookup));
	if (!profile) {
		return updateMessageResponse({
			content: 'That player slipped out of the public data for now. Run `/stats` again with the name or ID.',
			embeds: [],
			components: [],
		});
	}
	const embeds = await buildStatsEmbeds(profile, env);
	const selected = Math.max(0, Math.min(embeds.length - 1, page));
	return updateMessageResponse({
		embeds: [embeds[selected]],
		components: statsMenu(profile, selected),
	});
}

async function editStatsResponse(interaction, env, player, waitUntil) {
	try {
		const profile = await fetchProfileByPlayerOption(player);
		if (!profile) {
			await editOriginalInteractionResponse(env, interaction.token, {
				...simpleErrorMessage('Player not found', "I couldn't find that player. Check the spelling or ID and send me back in.", false),
			});
			return;
		}
		recordProfileLookupSoon(env, profile, waitUntil, interactionUserId(interaction), player);
		const [report, tagRecord] = await Promise.all([getAcceptedReport(env, playerId(profile)), getPlayerTagRecord(env, playerId(profile))]);
		await editOriginalInteractionResponse(
			env,
			interaction.token,
			statsDashboardMessage({
				profile,
				report,
				tagRecord,
			}),
		);
	} catch (error) {
		console.error(error);
		await editOriginalInteractionResponse(env, interaction.token, {
			...simpleErrorMessage('Stats unavailable', "Stats are having a quiet moment. Try again in a bit and I'll take another swing.", false),
		});
	}
}

async function handle(interaction, env, runtime) {
	const player =
		optionValue(interaction.data?.options, 'player') ||
		optionValue(interaction.data?.options, 'ign') ||
		optionValue(interaction.data?.options, 'player_id');
	if (!player) {
		return interactionResponse({
			...simpleErrorMessage('Missing player', 'Drop a player first: `/stats player:<name-or-id>`.'),
			flags: EPHEMERAL | 32768,
		});
	}
	runInBackground(runtime, () => editStatsResponse(interaction, env, player, runtime?.waitUntil?.bind(runtime)));
	return deferredInteractionResponse();
}

async function loadStatsContext(env, lookup) {
	const profile = await fetchProfileByPlayerOption(lookup);
	if (!profile) {
		return undefined;
	}
	const [report, tagRecord] = await Promise.all([getAcceptedReport(env, playerId(profile)), getPlayerTagRecord(env, playerId(profile))]);
	return {
		profile,
		report,
		tagRecord,
	};
}

async function handleStatsComponent(interaction, env, runtime) {
	const parsed = parseCustomId(interaction.data?.custom_id);
	const action = parsed?.action;
	const lookup = parsed?.args.join(':') || '';
	if (!lookup) {
		return interactionResponse(simpleErrorMessage('Stale stats control', 'This stats action is missing its player key.'));
	}
	if (action === 'compare') {
		return modalResponse({
			custom_id: customId('compare', 'modal', lookup),
			title: 'Compare players',
			components: [
				labelComponent(
					'Second player',
					textInput('compare_player', TEXT_INPUT_SHORT, {
						minLength: 1,
						maxLength: 64,
					}),
					'Critical Ops name or player ID',
				),
			],
		});
	}
	if (action === 'report') {
		const context2 = await loadStatsContext(env, lookup);
		return openPrefilledReportModal(lookup, context2?.profile ? displayName(context2.profile) : lookup);
	}
	if (action === 'profile') {
		runInBackground(runtime, async () => {
			try {
				const context2 = await loadStatsContext(env, lookup);
				if (!context2) {
					await editOriginalInteractionResponse(
						env,
						interaction.token,
						simpleErrorMessage('Player not found', 'That player is not in public data right now.', false),
					);
					return;
				}
				const card = await getOrRenderPlayerCardFromProfile(env, lookup, context2.profile, runtime?.waitUntil?.bind(runtime), {
					report: context2.report,
					tags: context2.tagRecord?.tags || [],
				});
				await sendProfileCardResponse(interaction, env, card, context2.profile, {
					presentation: 'container',
				});
			} catch (error) {
				console.error(error);
				await editOriginalInteractionResponse(
					env,
					interaction.token,
					simpleErrorMessage('Profile unavailable', 'Profile cards are not rendering right now. Try `/profile` again in a moment.', false),
				);
			}
		});
		return deferredUpdateMessageResponse();
	}
	const context = await loadStatsContext(env, lookup);
	if (!context) {
		return updateMessageResponse(
			simpleErrorMessage(
				'Player not found',
				'That player is not in public data right now. Run `/stats` again with a fresh name or ID.',
				false,
			),
		);
	}
	if (action === 'track') {
		const userId = interactionUserId(interaction);
		if (!userId || !env.USER_PREFERENCES) {
			return interactionResponse(simpleErrorMessage('Tracking unavailable', 'Tracking needs a Discord user and KV storage.'));
		}
		const result = await toggleTrackedProfile(env, userId, lookup);
		if (!result.ok) {
			return interactionResponse(
				simpleErrorMessage(
					result.reason === 'full' ? 'Tracking list full' : 'Player not found',
					result.reason === 'full'
						? 'Your tracking list is full at 25 players. Remove one before adding another.'
						: "I couldn't find that player, so I left your tracking list alone.",
				),
			);
		}
	}
	const view = action === 'view' ? interaction.data?.values?.[0] || 'overview' : 'overview';
	return updateMessageResponse(
		statsDashboardMessage({
			profile: context.profile,
			report: context.report,
			tagRecord: context.tagRecord,
			view,
		}),
	);
}

const statsCommand = {
	definition: definition,
	handle: handle,
};

export { buildStatsEmbeds, handleStatsComponent, handleStatsPage, statsCommand };
