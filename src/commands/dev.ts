// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.
import { devDashboardMessage, simpleErrorMessage } from '../lib/app-ui';
import { displayName, fetchProfileByPlayerOption, playerId } from '../lib/cops';
import {
	APPLICATION_COMMAND_OPTION_STRING,
	EPHEMERAL,
	USER_INSTALLABLE_CONTEXTS,
	interactionResponse,
	interactionUserId,
	optionValue,
} from '../lib/discord';
import { PLAYER_TAG_BY_ID, PLAYER_TAG_DEFINITIONS, parsePlayerTagId } from '../lib/player-tags';
import { clearPlayerCardLookupCaches } from '../lib/profile-card-cache';
import { sendMonthlyCommunityRecap } from '../lib/reporting';
import { addPlayerTag, deleteAcceptedReport, deleteReportBlacklistEntry, putReportBlacklistEntry, removePlayerTag } from '../lib/storage';

const definition = {
	name: 'dev',
	description: 'Developer-only Patch tools.',
	type: 1,
	options: [
		{
			name: 'task',
			description: 'Cleanup task to run.',
			type: APPLICATION_COMMAND_OPTION_STRING,
			required: true,
			choices: [
				{ name: 'Clear accepted report', value: 'report-clear' },
				{ name: 'Add player tag', value: 'tag-add' },
				{ name: 'Remove player tag', value: 'tag-remove' },
				{ name: 'Clear player tags', value: 'tag-clear' },
				{ name: 'Pause user reports', value: 'reports-pause' },
				{ name: 'Resume user reports', value: 'reports-resume' },
				{ name: 'Community recap', value: 'community-recap' },
			],
		},
		{
			name: 'target',
			description: 'Player name/ID, or Discord user ID/mention for report pauses.',
			type: APPLICATION_COMMAND_OPTION_STRING,
			required: false,
			min_length: 1,
			max_length: 100,
		},
		{
			name: 'tag',
			description: 'Public tag for tag-add or tag-remove.',
			type: APPLICATION_COMMAND_OPTION_STRING,
			required: false,
			choices: PLAYER_TAG_DEFINITIONS.map((tag) => ({
				name: tag.label,
				value: tag.id,
			})),
		},
		{
			name: 'note',
			description: 'Staff note for pausing reports.',
			type: APPLICATION_COMMAND_OPTION_STRING,
			required: false,
			min_length: 3,
			max_length: 200,
		},
	],
	...USER_INSTALLABLE_CONTEXTS,
};
function developerIds(env) {
	return (env.DEVELOPER_DISCORD_USER_IDS || '')
		.split(',')
		.map((value) => value.trim())
		.filter(Boolean);
}

async function handleRemoveReport(env, target) {
	if (!target) {
		return interactionResponse({
			...devDashboardMessage('Give me the player to clear: `/dev task:Clear accepted report target:<name-or-id>`.', false),
			flags: EPHEMERAL | 32768,
		});
	}
	const profile = await fetchProfileByPlayerOption(target);
	const targetPlayerId = profile ? playerId(profile) : /^\d+$/.test(target) ? target : undefined;
	const targetName = profile ? displayName(profile) : target;
	if (!targetPlayerId) {
		return interactionResponse({
			...devDashboardMessage("I couldn't resolve that player ID, so I left the accepted reports untouched.", false),
			flags: EPHEMERAL | 32768,
		});
	}
	await deleteAcceptedReport(env, targetPlayerId);
	await clearPlayerCardLookupCaches(env, [target, targetPlayerId, targetName]);
	return interactionResponse({
		...devDashboardMessage(`Accepted report removed for **${targetName}**. Future stats and profile cards get a clean read.`),
		flags: EPHEMERAL | 32768,
	});
}

async function resolvePlayerTarget(player) {
	const profile = await fetchProfileByPlayerOption(player);
	const targetPlayerId = profile ? playerId(profile) : /^\d+$/.test(player) ? player : undefined;
	const targetName = profile ? displayName(profile) : player;
	return {
		targetPlayerId,
		targetName,
	};
}

async function handleTag(interaction, env, target, task, tagValue) {
	const developerId = interactionUserId(interaction) || 'unknown';
	const tag = parsePlayerTagId(tagValue);
	if (!target) {
		return interactionResponse({
			...devDashboardMessage('Give me the player to tag: `/dev task:Add player tag target:<name-or-id> tag:<tag>`.', false),
			flags: EPHEMERAL | 32768,
		});
	}
	if ((task === 'tag-add' || task === 'tag-remove') && !tag) {
		return interactionResponse({
			...devDashboardMessage('Pick one of the known public tags so Patch knows what badge to show.', false),
			flags: EPHEMERAL | 32768,
		});
	}
	const { targetPlayerId, targetName } = await resolvePlayerTarget(target);
	if (!targetPlayerId) {
		return interactionResponse({
			...devDashboardMessage("I couldn't resolve that player ID, so I left the public tags untouched.", false),
			flags: EPHEMERAL | 32768,
		});
	}
	if (task === 'tag-add' && tag) {
		await addPlayerTag(env, targetPlayerId, targetName, tag, developerId);
		await clearPlayerCardLookupCaches(env, [target, targetPlayerId, targetName]);
		return interactionResponse({
			...devDashboardMessage(`Added **${PLAYER_TAG_BY_ID[tag].label}** to **${targetName}**. Future stats and profile cards will show it.`),
			flags: EPHEMERAL | 32768,
		});
	}
	if (task === 'tag-remove' || task === 'tag-clear') {
		const removedTag = task === 'tag-clear' ? undefined : tag;
		await removePlayerTag(env, targetPlayerId, removedTag, developerId);
		await clearPlayerCardLookupCaches(env, [target, targetPlayerId, targetName]);
		return interactionResponse({
			...devDashboardMessage(
				removedTag
					? `Removed **${PLAYER_TAG_BY_ID[removedTag].label}** from **${targetName}**.`
					: `Removed all public tags from **${targetName}**.`,
			),
			flags: EPHEMERAL | 32768,
		});
	}
	return interactionResponse({
		...devDashboardMessage('Pick a tag task so Patch knows what to do with the public tag.', false),
		flags: EPHEMERAL | 32768,
	});
}

async function handleReportAccess(interaction, env, target, paused, reason) {
	const developerId = interactionUserId(interaction) || 'unknown';
	const userId = target?.replace(/[<@!>]/g, '');
	if (!userId || !/^\d+$/.test(userId)) {
		return interactionResponse({
			...devDashboardMessage('Give me a Discord user ID, or a user mention I can turn into one.', false),
			flags: EPHEMERAL | 32768,
		});
	}
	if (paused) {
		await putReportBlacklistEntry(env, userId, developerId, reason);
		return interactionResponse({
			...devDashboardMessage(`Report submissions are now paused for <@${userId}>.`),
			flags: EPHEMERAL | 32768,
		});
	}
	await deleteReportBlacklistEntry(env, userId);
	return interactionResponse({
		...devDashboardMessage(`Report submissions are open again for <@${userId}>.`),
		flags: EPHEMERAL | 32768,
	});
}

async function handle(interaction, env) {
	const userId = interactionUserId(interaction);
	if (!userId || !developerIds(env).includes(userId)) {
		return interactionResponse(simpleErrorMessage('Developer command', 'That one is for the Patch dev seat.'));
	}
	if (!env.USER_PREFERENCES) {
		return interactionResponse(
			simpleErrorMessage('Developer storage unavailable', 'Dev report tools need KV storage before they can tidy anything up.'),
		);
	}
	const task = optionValue(interaction.data?.options, 'task');
	const target = optionValue(interaction.data?.options, 'target');
	const tag = optionValue(interaction.data?.options, 'tag');
	const note = optionValue(interaction.data?.options, 'note');
	if (task === 'report-clear') {
		return handleRemoveReport(env, target);
	}
	if (task === 'tag-add' || task === 'tag-remove' || task === 'tag-clear') {
		return handleTag(interaction, env, target, task, tag);
	}
	if (task === 'reports-pause' || task === 'reports-resume') {
		return handleReportAccess(interaction, env, target, task === 'reports-pause', note);
	}
	if (task === 'community-recap') {
		const result = await sendMonthlyCommunityRecap(env);
		return interactionResponse({
			...devDashboardMessage(
				`${result.sent ? 'Posted' : 'Built'} the **${result.recap.month}** community recap: ${result.recap.reportsReviewed} reviewed, ${result.recap.bansConfirmed} bans confirmed.`,
			),
			flags: EPHEMERAL | 32768,
		});
	}
	return interactionResponse({
		...devDashboardMessage('Use `/dev task:<task> target:<player-or-user>` for the dev tools.', false),
		flags: EPHEMERAL | 32768,
	});
}

const devCommand = {
	definition: definition,
	handle: handle,
};

export { devCommand };
