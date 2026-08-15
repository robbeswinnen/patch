// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.
import { simpleErrorMessage, trackingDashboardMessage } from '../lib/app-ui';
import { customId, parseCustomId } from '../lib/components-v2';
import {
	IS_COMPONENTS_V2,
	PLAYER_OPTION,
	TEXT_INPUT_SHORT,
	USER_INSTALLABLE_CONTEXTS,
	interactionResponse,
	interactionUserId,
	labelComponent,
	modalResponse,
	modalValue,
	optionValue,
	textInput,
	updateMessageResponse,
	withEphemeralFlag,
} from '../lib/discord';
import { recordProfileLookupSoon } from '../lib/lookup-counts';
import { getTracker, putTracker } from '../lib/storage';
import { acceptTrackerBaselines, addTrackedProfile, refreshTrackerRecord, trackingChanges } from '../lib/tracking';

const definition = {
	name: 'track',
	description: 'View tracked changes or add a player to your tracking dashboard.',
	type: 1,
	options: [
		{
			name: 'player',
			...PLAYER_OPTION,
			required: false,
		},
	],
	...USER_INSTALLABLE_CONTEXTS,
};
async function dashboardForUser(env, userId, force = true) {
	const record = await getTracker(env, userId);
	await refreshTrackerRecord(env, record, { force });
	const changes = trackingChanges(record);
	const message = trackingDashboardMessage({ record, changes });
	acceptTrackerBaselines(record);
	await putTracker(env, record);
	return message;
}

async function handleAdd(interaction, env, userId, player, runtime, responseKind = 'message') {
	const result = await addTrackedProfile(env, userId, player);
	if (!result.ok) {
		return interactionResponse(
			withEphemeralFlag(
				simpleErrorMessage(
					result.reason === 'full' ? 'Tracking list full' : 'Player not found',
					result.reason === 'full'
						? 'Your tracking list is full at 25 players. Remove one before adding another.'
						: "I couldn't find that player. Check the spelling or ID and send me back in.",
				),
			),
		);
	}
	recordProfileLookupSoon(env, result.profile, runtime?.waitUntil?.bind(runtime), userId, player);
	const changes = trackingChanges(result.record);
	const message = trackingDashboardMessage({ record: result.record, changes });
	acceptTrackerBaselines(result.record);
	await putTracker(env, result.record);
	return responseKind === 'update' ? updateMessageResponse(withEphemeralFlag(message)) : interactionResponse(withEphemeralFlag(message));
}

async function handle(interaction, env, runtime) {
	const userId = interactionUserId(interaction);
	if (!userId) {
		return interactionResponse(
			withEphemeralFlag(
				simpleErrorMessage('Tracking unavailable', "I can't tell who owns this tracking list. Try again from your own Discord account."),
			),
		);
	}
	if (!env.USER_PREFERENCES) {
		return interactionResponse(
			withEphemeralFlag(simpleErrorMessage('Tracking unavailable', 'Tracking needs KV storage before it can remember players.')),
		);
	}
	const player = optionValue(interaction.data?.options, 'player');
	if (player) {
		return handleAdd(interaction, env, userId, player, runtime);
	}
	return interactionResponse(withEphemeralFlag(await dashboardForUser(env, userId, true)));
}

function addPlayerModal() {
	return modalResponse({
		custom_id: customId('track', 'add-modal'),
		title: 'Add tracked player',
		components: [
			labelComponent(
				'Player',
				textInput('track_player', TEXT_INPUT_SHORT, {
					minLength: 1,
					maxLength: 64,
				}),
				'Critical Ops name or player ID',
			),
		],
	});
}

async function handleTrackComponent(interaction, env) {
	const userId = interactionUserId(interaction);
	if (!userId || !env.USER_PREFERENCES) {
		return interactionResponse(simpleErrorMessage('Tracking unavailable', 'Tracking needs a Discord user and KV storage.'));
	}
	const parsed = parseCustomId(interaction.data?.custom_id);
	const action = parsed?.action;
	if (action === 'add') {
		return addPlayerModal();
	}
	if (action === 'public' && interaction.message?.components?.length) {
		return interactionResponse({
			flags: IS_COMPONENTS_V2,
			components: interaction.message.components,
			allowed_mentions: {
				parse: [],
			},
		});
	}
	const record = await getTracker(env, userId);
	if (action === 'remove') {
		const key = parsed?.args.join(':') || '';
		record.players = record.players.filter((player) => player.key !== key);
		await putTracker(env, record);
		return updateMessageResponse(trackingDashboardMessage({ record, changes: trackingChanges(record) }));
	}
	if (action === 'public') {
		return interactionResponse(
			trackingDashboardMessage({
				record,
				changes: trackingChanges(record),
				ephemeral: false,
			}),
		);
	}
	if (action === 'refresh') {
		await refreshTrackerRecord(env, record, { force: true });
		const changes = trackingChanges(record);
		const message = trackingDashboardMessage({ record, changes });
		acceptTrackerBaselines(record);
		await putTracker(env, record);
		return updateMessageResponse(message);
	}
	return interactionResponse(
		simpleErrorMessage('Stale tracking control', 'That tracking control is no longer available. Run `/track` again.'),
	);
}

async function handleTrackModalSubmit(interaction, env, runtime) {
	const userId = interactionUserId(interaction);
	const player = modalValue(interaction, 'track_player');
	if (!userId || !player || !env.USER_PREFERENCES) {
		return interactionResponse(
			simpleErrorMessage('Tracking unavailable', 'Give me a player and make sure tracking storage is configured.'),
		);
	}
	return handleAdd(interaction, env, userId, player, runtime, 'update');
}

const trackCommand = {
	definition: definition,
	handle: handle,
};

export { handleTrackComponent, handleTrackModalSubmit, trackCommand };
