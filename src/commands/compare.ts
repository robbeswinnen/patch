// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.
import { compareMessage, simpleErrorMessage } from '../lib/app-ui';
import {
	EMBED_COLOR,
	displayName,
	fetchProfileByPlayerOption,
	fieldValue,
	formatDecimal,
	formatInteger,
	formatLastOnline,
	formatOptionalInteger,
	formatPercentValue,
	formatStats,
	kdValue,
	kdaValue,
	killsPerMatchValue,
	latestSeason,
	numberOrZero,
	peakRankName,
	rankName,
	winRateValue,
} from '../lib/cops';
import {
	EPHEMERAL,
	PLAYER_OPTION,
	USER_INSTALLABLE_CONTEXTS,
	deferredInteractionResponse,
	editOriginalInteractionResponse,
	interactionResponse,
	interactionUserId,
	optionValue,
	runInBackground,
} from '../lib/discord';
import { recordProfileLookupSoon } from '../lib/lookup-counts';
import { embedImage, quoteList } from '../lib/presentation';

const definition = {
	name: 'compare',
	description: 'Compare two players with current-season context.',
	type: 1,
	options: [
		{
			name: 'player1',
			...PLAYER_OPTION,
		},
		{
			name: 'player2',
			...PLAYER_OPTION,
		},
	],
	...USER_INSTALLABLE_CONTEXTS,
};
function comparisonMetrics(a, b) {
	const aRanked = latestSeason(a)?.ranked;
	const bRanked = latestSeason(b)?.ranked;
	return [
		{
			label: 'MMR',
			a: a.stats?.ranked?.mmr,
			b: b.stats?.ranked?.mmr,
			formatter: (value) => formatOptionalInteger(value),
			diffFormatter: (diff) => formatInteger(Math.abs(diff)),
		},
		{
			label: 'Ranked K/D',
			a: kdValue(aRanked),
			b: kdValue(bRanked),
			formatter: (value) => formatDecimal(value),
			diffFormatter: (diff) => formatDecimal(Math.abs(diff)),
		},
		{
			label: 'Ranked KDA',
			a: kdaValue(aRanked),
			b: kdaValue(bRanked),
			formatter: (value) => formatDecimal(value),
			diffFormatter: (diff) => formatDecimal(Math.abs(diff)),
		},
		{
			label: 'Ranked winrate',
			a: winRateValue(aRanked),
			b: winRateValue(bRanked),
			formatter: (value) => formatPercentValue(value),
			diffFormatter: (diff) => `${formatDecimal(Math.abs(diff), 1)} pts`,
		},
		{
			label: 'Kills/match',
			a: killsPerMatchValue(aRanked),
			b: killsPerMatchValue(bRanked),
			formatter: (value) => formatDecimal(value),
			diffFormatter: (diff) => formatDecimal(Math.abs(diff)),
		},
	];
}

function winnerForMetric(metric, aName, bName) {
	if (typeof metric.a !== 'number' || typeof metric.b !== 'number') {
		return {
			label: 'No data',
			score: 0,
		};
	}
	const diff = metric.a - metric.b;
	if (Math.abs(diff) < 1e-4) {
		return {
			label: 'Dead even',
			score: 0,
		};
	}
	return {
		label: diff > 0 ? aName : bName,
		score: diff > 0 ? 1 : -1,
	};
}

function comparisonSummary(metrics, aName, bName) {
	const score = metrics.reduce((total, metric) => {
		return total + winnerForMetric(metric, aName, bName).score;
	}, 0);
	if (score > 0) {
		return `${aName} has the current-season edge (${score} metrics).`;
	}
	if (score < 0) {
		return `${bName} has the current-season edge (${Math.abs(score)} metrics).`;
	}
	return 'This looks even with the current-season data available.';
}

function comparisonEdges(metrics, aName, bName) {
	return metrics
		.map((metric) => {
			const winner = winnerForMetric(metric, aName, bName);
			if (winner.label === 'No data' || winner.label === 'Dead even') {
				return `${metric.label}: ${winner.label}`;
			}
			const diff = numberOrZero(metric.a) - numberOrZero(metric.b);
			return `${metric.label}: ${winner.label} by ${metric.diffFormatter(diff)}`;
		})
		.join('\n');
}

function buildCompareEmbed(playerA, playerB) {
	const aName = displayName(playerA);
	const bName = displayName(playerB);
	const metrics = comparisonMetrics(playerA, playerB);
	const aPeak = peakRankName(playerA.stats?.ranked) || 'Unknown';
	const bPeak = peakRankName(playerB.stats?.ranked) || 'Unknown';
	const aLastOnline = formatLastOnline(playerA);
	const bLastOnline = formatLastOnline(playerB);
	const aContext = [
		`${formatOptionalInteger(playerA.stats?.ranked?.mmr)} MMR`,
		`peak ${aPeak}`,
		aLastOnline ? `last online ${aLastOnline}` : undefined,
	]
		.filter(Boolean)
		.join(', ');
	const bContext = [
		`${formatOptionalInteger(playerB.stats?.ranked?.mmr)} MMR`,
		`peak ${bPeak}`,
		bLastOnline ? `last online ${bLastOnline}` : undefined,
	]
		.filter(Boolean)
		.join(', ');
	return {
		title: `${aName} vs ${bName}`,
		description: [
			'## Current-season matchup',
			quoteList([
				'Patch checks ranked rates and MMR from the public profile data.',
				'This is built for friendly server debates, not lifetime verdicts.',
			]),
		].join('\n'),
		color: EMBED_COLOR,
		image: embedImage('compare'),
		timestamp: /* @__PURE__ */ new Date().toISOString(),
		fields: [
			{
				name: 'Overall edge',
				value: fieldValue(quoteList([comparisonSummary(metrics, aName, bName)])),
				inline: false,
			},
			{
				name: 'Ranks',
				value: fieldValue(
					quoteList([
						`**${aName}:** ${rankName(playerA.stats?.ranked)} (${aContext})`,
						`**${bName}:** ${rankName(playerB.stats?.ranked)} (${bContext})`,
					]),
				),
				inline: false,
			},
			{
				name: 'Where each player is stronger',
				value: fieldValue(quoteList(comparisonEdges(metrics, aName, bName).split('\n'))),
				inline: false,
			},
			{
				name: `${aName} current ranked`,
				value: fieldValue(quoteList(formatStats(latestSeason(playerA)?.ranked).split('\n'))),
				inline: true,
			},
			{
				name: `${bName} current ranked`,
				value: fieldValue(quoteList(formatStats(latestSeason(playerB)?.ranked).split('\n'))),
				inline: true,
			},
		],
	};
}

async function editCompareResponse(interaction, env, player1, player2, waitUntil) {
	try {
		const [profile1, profile2] = await Promise.all([fetchProfileByPlayerOption(player1), fetchProfileByPlayerOption(player2)]);
		if (!profile1 || !profile2) {
			const missing = [!profile1 ? player1 : undefined, !profile2 ? player2 : undefined].filter(Boolean).join(', ');
			await editOriginalInteractionResponse(env, interaction.token, {
				...simpleErrorMessage(
					'Compare unavailable',
					`I couldn't find **${missing}**. Check the spelling or IDs and send the matchup again.`,
					false,
				),
			});
			return;
		}
		const userId = interactionUserId(interaction);
		recordProfileLookupSoon(env, profile1, waitUntil, userId, player1);
		recordProfileLookupSoon(env, profile2, waitUntil, userId, player2);
		await editOriginalInteractionResponse(env, interaction.token, compareMessage(profile1, profile2));
	} catch (error) {
		console.error(error);
		await editOriginalInteractionResponse(env, interaction.token, {
			...simpleErrorMessage('Compare unavailable', 'The matchup board is not loading right now. Give it a bit and try again.', false),
		});
	}
}

async function handle(interaction, env, runtime) {
	const player1 = optionValue(interaction.data?.options, 'player1');
	const player2 = optionValue(interaction.data?.options, 'player2');
	if (!player1 || !player2) {
		return interactionResponse({
			...simpleErrorMessage('Missing players', 'Give me two players to put side by side: `/compare player1:<name> player2:<name>`.'),
			flags: EPHEMERAL | 32768,
		});
	}
	runInBackground(runtime, () => editCompareResponse(interaction, env, player1, player2, runtime?.waitUntil?.bind(runtime)));
	return deferredInteractionResponse();
}

const compareCommand = {
	definition: definition,
	handle: handle,
};

export { buildCompareEmbed, compareCommand };
