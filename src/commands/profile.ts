// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.
import { openPrefilledReportModal } from './report';
import { compareMessage, simpleErrorMessage, statsDashboardMessage } from '../lib/app-ui';
import { customId, parseCustomId } from '../lib/components-v2';
import { displayName, fetchProfileByPlayerOption, playerId } from '../lib/cops';
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
	modalValue,
	optionValue,
	runInBackground,
	textInput,
	updateMessageResponse,
} from '../lib/discord';
import { recordProfileLookup } from '../lib/lookup-counts';
import { getOrRenderPlayerCardFromProfile } from '../lib/profile-card-cache';
import { sendProfileCardResponse } from '../lib/profile-card-response';
import { getAcceptedReport, getPlayerTagRecord } from '../lib/storage';
import { toggleTrackedProfile } from '../lib/tracking';

const definition = {
	name: 'profile',
	description: 'Generate a shareable player profile card.',
	type: 1,
	options: [
		{
			name: 'player',
			...PLAYER_OPTION,
		},
	],
	...USER_INSTALLABLE_CONTEXTS,
};
async function editCard(interaction, env, card, profile, presentation = 'attachment') {
	await sendProfileCardResponse(interaction, env, card, profile, { presentation });
}

async function renderAndEditCard(interaction, env, player, waitUntil, _view = 'overview', presentation = 'attachment') {
	try {
		const profile = await fetchProfileByPlayerOption(player);
		if (!profile) {
			await editOriginalInteractionResponse(env, interaction.token, {
				...simpleErrorMessage('Player not found', "I couldn't find that player. Check the spelling or ID and send me back in.", false),
				attachments: [],
			});
			return;
		}
		const targetPlayerId = playerId(profile);
		const userId = interactionUserId(interaction);
		const [lookupCount, report, tagRecord] = await Promise.all([
			recordProfileLookup(env, profile, userId, player),
			getAcceptedReport(env, targetPlayerId),
			getPlayerTagRecord(env, targetPlayerId),
		]);
		const card = await getOrRenderPlayerCardFromProfile(env, player, profile, waitUntil, {
			report,
			tags: tagRecord?.tags || [],
			lookupCount,
		});
		await editCard(interaction, env, card, profile, presentation);
	} catch (error) {
		console.error(error);
		try {
			await editOriginalInteractionResponse(env, interaction.token, {
				...simpleErrorMessage(
					'Profile unavailable',
					'Profile cards are taking a slow lap right now. Give it a moment and try again.',
					false,
				),
				attachments: [],
			});
		} catch (editError) {
			console.error(editError);
		}
	}
}

async function handle(interaction, env, runtime) {
	const player = optionValue(interaction.data?.options, 'player');
	if (!player) {
		return interactionResponse({
			...simpleErrorMessage('Missing player', 'Drop a player first: `/profile player:<name-or-id>`.'),
			flags: EPHEMERAL | 32768,
		});
	}
	const waitUntil = runtime?.waitUntil?.bind(runtime);
	runInBackground(runtime, () => renderAndEditCard(interaction, env, player, waitUntil));
	return deferredInteractionResponse();
}

async function loadProfileContext(env, lookup) {
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

async function handleProfileComponent(interaction, env, runtime) {
	const parsed = parseCustomId(interaction.data?.custom_id);
	const action = parsed?.action;
	const lookup = parsed?.args.join(':') || '';
	if (!lookup) {
		return interactionResponse(simpleErrorMessage('Stale profile control', 'This profile action is missing its player key.'));
	}
	if (action === 'refresh') {
		runInBackground(runtime, () => renderAndEditCard(interaction, env, lookup, runtime?.waitUntil?.bind(runtime), 'overview', 'container'));
		return deferredUpdateMessageResponse();
	}
	if (action === 'view') {
		const view = interaction.data?.values?.[0] || 'overview';
		runInBackground(runtime, () => renderAndEditCard(interaction, env, lookup, runtime?.waitUntil?.bind(runtime), view, 'container'));
		return deferredUpdateMessageResponse();
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
		const context2 = await loadProfileContext(env, lookup);
		return openPrefilledReportModal(lookup, context2?.profile ? displayName(context2.profile) : lookup);
	}
	const context = await loadProfileContext(env, lookup);
	if (!context) {
		return updateMessageResponse(
			simpleErrorMessage(
				'Player not found',
				'That player is not in public data right now. Run `/profile` again with a fresh name or ID.',
				false,
			),
		);
	}
	if (action === 'stats') {
		return updateMessageResponse({
			...statsDashboardMessage({
				profile: context.profile,
				report: context.report,
				tagRecord: context.tagRecord,
			}),
			attachments: [],
		});
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
		return updateMessageResponse({
			...statsDashboardMessage({
				profile: context.profile,
				report: context.report,
				tagRecord: context.tagRecord,
				view: 'actions',
			}),
			attachments: [],
		});
	}
	return interactionResponse(
		simpleErrorMessage('Stale profile control', 'That profile action is no longer available. Run `/profile` again.'),
	);
}

async function handleCompareModalSubmit(interaction, env, runtime) {
	const parsed = parseCustomId(interaction.data?.custom_id);
	const lookup = parsed?.args.join(':') || '';
	const second = modalValue(interaction, 'compare_player');
	runInBackground(runtime, async () => {
		try {
			const [profile1, profile2] = await Promise.all([
				fetchProfileByPlayerOption(lookup),
				fetchProfileByPlayerOption(String(second || '')),
			]);
			if (!profile1 || !profile2) {
				await editOriginalInteractionResponse(
					env,
					interaction.token,
					simpleErrorMessage(
						'Compare unavailable',
						"I couldn't find one of those players. Check the spelling or IDs and try again.",
						false,
					),
				);
				return;
			}
			const userId = interactionUserId(interaction);
			await Promise.all([
				recordProfileLookup(env, profile1, userId, lookup),
				recordProfileLookup(env, profile2, userId, String(second || '')),
			]);
			await editOriginalInteractionResponse(env, interaction.token, compareMessage(profile1, profile2));
		} catch (error) {
			console.error(error);
			await editOriginalInteractionResponse(
				env,
				interaction.token,
				simpleErrorMessage('Compare unavailable', 'The matchup board is not loading right now. Give it a bit and try again.', false),
			);
		}
	});
	return deferredInteractionResponse();
}

const profileCommand = {
	definition: definition,
	handle: handle,
};

export { handleCompareModalSubmit, handleProfileComponent, profileCommand };
