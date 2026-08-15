// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.
import { verifyKey } from 'discord-interactions';
import { handleHelpComponent } from './commands/help';
import { buildCompareEmbed } from './commands/compare';
import { COMMANDS, DISCORD_COMMANDS } from './commands/index';
import { handleCompareModalSubmit, handleProfileComponent } from './commands/profile';
import { handlePrefilledReportModal, handleReportReview, handleReportReviewModal, handleReportSubmitModal } from './commands/report';
import { buildStatsEmbeds, handleStatsComponent, handleStatsPage } from './commands/stats';
import { handleTrackComponent, handleTrackModalSubmit } from './commands/track';
import { simpleErrorMessage } from './lib/app-ui';
import { runBanWatcher } from './lib/ban-watcher';
import { warmPlayerCardRenderer } from './lib/card-image';
import { parseCustomId } from './lib/components-v2';
import {
	APPLICATION_COMMAND,
	EPHEMERAL,
	MESSAGE_COMPONENT,
	MODAL_SUBMIT,
	applyPrivateResponseOption,
	interactionResponse,
	jsonResponse,
} from './lib/discord';
import { marketingHomepage } from './lib/homepage';
import { startOnboardingSoon } from './lib/onboarding';
import { refreshStaffReviewAnalytics, updateMonthlyCommunityRecapBaseline } from './lib/reporting';
import { runScheduledRankedUpdates } from './lib/tracking';

const MAX_INTERACTION_BODY_BYTES = 1024 * 1024;

async function readInteractionBody(request) {
	const declaredLength = Number(request.headers.get('content-length') || '0');
	if (Number.isFinite(declaredLength) && declaredLength > MAX_INTERACTION_BODY_BYTES) {
		return undefined;
	}
	if (!request.body) {
		return '';
	}

	const reader = request.body.getReader();
	const chunks = [];
	let totalBytes = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				break;
			}
			totalBytes += value.byteLength;
			if (totalBytes > MAX_INTERACTION_BODY_BYTES) {
				await reader.cancel();
				return undefined;
			}
			chunks.push(value);
		}
	} finally {
		reader.releaseLock();
	}

	const bytes = new Uint8Array(totalBytes);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return new TextDecoder().decode(bytes);
}

async function handleComponent(interaction, env, runtime) {
	const customIdValue = interaction.data?.custom_id || '';
	const parsed = parseCustomId(customIdValue);
	if (parsed?.scope === 'profile') {
		return handleProfileComponent(interaction, env, runtime);
	}
	if (parsed?.scope === 'stats') {
		return handleStatsComponent(interaction, env, runtime);
	}
	if (parsed?.scope === 'track') {
		return handleTrackComponent(interaction, env);
	}
	if (parsed?.scope === 'help') {
		return handleHelpComponent(interaction, env);
	}
	if (customIdValue.startsWith('stats_page:')) {
		return handleStatsPage(interaction, env);
	}
	if (customIdValue.startsWith('report_accept:') || customIdValue.startsWith('report_reject:')) {
		return handleReportReview(interaction, env);
	}
	return interactionResponse(
		simpleErrorMessage('Stale control', "That menu is from an older message. Run the command again and I'll rebuild it fresh."),
	);
}

async function handleModalSubmit(interaction, env, runtime) {
	const customIdValue = interaction.data?.custom_id || '';
	const parsed = parseCustomId(customIdValue);
	if (parsed?.scope === 'compare' && parsed.action === 'modal') {
		return handleCompareModalSubmit(interaction, env, runtime);
	}
	if (parsed?.scope === 'report' && parsed.action === 'profile') {
		return handlePrefilledReportModal(interaction, env, runtime);
	}
	if (parsed?.scope === 'track' && parsed.action === 'add-modal') {
		return handleTrackModalSubmit(interaction, env, runtime);
	}
	if (customIdValue.startsWith('report_submit:')) {
		return handleReportSubmitModal(interaction, env, runtime);
	}
	if (customIdValue.startsWith('report_review:')) {
		return handleReportReviewModal(interaction, env, runtime);
	}
	return interactionResponse(
		simpleErrorMessage('Stale form', 'That form is from an older Patch message. Run the command again and I\u2019ll rebuild it fresh.'),
	);
}

async function handleInteraction(interaction, env = {}, runtime) {
	if (interaction.type === 1) {
		return jsonResponse({ type: 1 });
	}
	if (interaction.type === MESSAGE_COMPONENT) {
		return handleComponent(interaction, env, runtime);
	}
	if (interaction.type === MODAL_SUBMIT) {
		return handleModalSubmit(interaction, env, runtime);
	}
	if (interaction.type !== APPLICATION_COMMAND) {
		return jsonResponse({ error: 'Unknown interaction' }, 400);
	}
	const commandName = interaction.data?.name;
	const command = COMMANDS.find((candidate) => candidate.definition.name === commandName);
	if (command) {
		startOnboardingSoon(interaction, env, command.definition.name, runtime);
		return applyPrivateResponseOption(interaction, await command.handle(interaction, env, runtime));
	}
	if (commandName === 'cops') {
		return applyPrivateResponseOption(
			interaction,
			await COMMANDS.find((candidate) => candidate.definition.name === 'stats').handle(interaction, env, runtime),
		);
	}
	return interactionResponse({
		...simpleErrorMessage('Command unavailable', "That command is not on Patch's board yet. Try `/help` for the menu."),
		flags: EPHEMERAL | 32768,
	});
}

const worker = {
	async fetch(request, env, ctx) {
		if (request.method === 'GET' || request.method === 'HEAD') {
			return marketingHomepage(request, env, request.method === 'GET');
		}
		if (request.method !== 'POST') {
			return new Response('This endpoint accepts GET for the Patch homepage and POST for Discord interactions.', {
				status: 405,
				headers: {
					Allow: 'GET, HEAD, POST',
					'Content-Type': 'text/plain; charset=utf-8',
				},
			});
		}
		const signature = request.headers.get('x-signature-ed25519');
		const signatureTimestamp = request.headers.get('x-signature-timestamp');
		if (!signature || !signatureTimestamp) {
			return new Response('Missing Discord signature headers.', {
				status: 401,
			});
		}
		const body = await readInteractionBody(request);
		if (body === undefined) {
			return new Response('Interaction payload is too large.', {
				status: 413,
			});
		}
		const isValidRequest = await verifyKey(body, signature, signatureTimestamp, env.DISCORD_PUBLIC_KEY);
		if (!isValidRequest) {
			return new Response('Invalid request signature.', {
				status: 401,
			});
		}
		let interaction;
		try {
			interaction = JSON.parse(body);
		} catch {
			return jsonResponse({ error: 'Invalid JSON' }, 400);
		}
		return handleInteraction(interaction, env, ctx);
	},
	async scheduled(_controller, env, ctx) {
		ctx.waitUntil(
			warmPlayerCardRenderer().catch((error) => {
				console.error('Failed to warm profile card renderer.', error);
			}),
		);
		ctx.waitUntil(runScheduledRankedUpdates(env));
		ctx.waitUntil(runBanWatcher(env));
		ctx.waitUntil(refreshStaffReviewAnalytics(env));
		ctx.waitUntil(updateMonthlyCommunityRecapBaseline(env));
	},
};

export { DISCORD_COMMANDS, buildCompareEmbed, buildStatsEmbeds, handleInteraction };

export default worker;
