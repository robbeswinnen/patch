// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.
import { reportReceiptMessage, simpleErrorMessage } from '../lib/app-ui';
import { sendReportDecisionDm } from '../lib/ban-watcher';
import {
	UI_ACCENT_DANGER,
	UI_ACCENT_SUCCESS,
	UI_ACCENT_WARNING,
	bulletList,
	container,
	customId,
	parseCustomId,
	separator,
	textDisplay,
	v2Message,
} from '../lib/components-v2';
import {
	displayName,
	fetchProfileByPlayerOption,
	formatLastOnline,
	formatOptionalInteger,
	formatStats,
	latestSeason,
	peakRankName,
	playerId,
	rankName,
} from '../lib/cops';
import {
	APPLICATION_COMMAND_OPTION_ATTACHMENT,
	BUTTON_SECONDARY,
	EPHEMERAL,
	PLAYER_OPTION,
	TEXT_INPUT_PARAGRAPH,
	TEXT_INPUT_SHORT,
	USER_INSTALLABLE_CONTEXTS,
	actionRow,
	button,
	deferredInteractionResponse,
	discordBotToken,
	editOriginalInteractionResponse,
	interactionResponse,
	interactionUserId,
	labelComponent,
	modalResponse,
	modalValue,
	optionAttachment,
	optionValue,
	runInBackground,
	sendDiscordMessage,
	textInput,
	updateMessageResponse,
} from '../lib/discord';
import { recordProfileLookupSoon } from '../lib/lookup-counts';
import { clearPlayerCardLookupCaches } from '../lib/profile-card-cache';
import { refreshStaffReviewAnalytics } from '../lib/reporting';
import {
	acceptReport,
	createPendingReport,
	createReportDraft,
	deleteReportDraft,
	getAcceptedReport,
	getPendingReport,
	getReportBlacklistEntry,
	getReportCooldown,
	getReportDraft,
	getReporterReputation,
	putAcceptedReport,
	putPendingReport,
	putReportCooldown,
	recordAutomaticallyAcceptedReport,
	rejectReport,
	reporterTierLabel,
	suspiciousPatternForReport,
} from '../lib/storage';

const REPORT_COOLDOWN_SECONDS = 10 * 60;
const definition = {
	name: 'report',
	description: 'Send a player report to Patch staff for review.',
	type: 1,
	options: [
		{
			name: 'player',
			...PLAYER_OPTION,
		},
		{
			name: 'proof',
			description: 'Image or video proof staff can review.',
			type: APPLICATION_COMMAND_OPTION_ATTACHMENT,
			required: true,
		},
	],
	...USER_INSTALLABLE_CONTEXTS,
};
function proofFromAttachment(attachment) {
	if (!attachment.url) {
		return undefined;
	}
	return {
		url: attachment.url,
		filename: attachment.filename,
		contentType: attachment.content_type,
		size: attachment.size,
	};
}

function isProofAttachment(attachment) {
	if (!attachment?.url) {
		return false;
	}
	const contentType = attachment.content_type || '';
	if (contentType.startsWith('image/') || contentType.startsWith('video/')) {
		return true;
	}
	return /\.(png|jpe?g|gif|webp|mp4|mov|m4v|webm)$/i.test(attachment.filename || attachment.url);
}

function cleanModalText(value, fallback = '') {
	return (value || fallback).replace(/\s+/g, ' ').trim();
}

function cleanParagraph(value) {
	return (value || '')
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean)
		.join('\n')
		.trim();
}

function linkText(value) {
	return (value || 'proof').replace(/[[\]()]/g, '').slice(0, 80);
}

function proofLine(proof) {
	if (!proof?.url) {
		return 'Proof: not attached';
	}
	const label = linkText(proof.filename);
	const type = proof.contentType ? ` (${proof.contentType})` : '';
	return `Proof: [${label}](${proof.url})${type}`;
}

function cooldownMessage(retryAt) {
	const retrySeconds = Math.floor(Date.parse(retryAt) / 1e3);
	return `Easy there, report cannon. Let staff chew through the last one first, then try again <t:${retrySeconds}:R>.`;
}

function reportSubmitModal(draftId) {
	return modalResponse({
		custom_id: `report_submit:${draftId}`,
		title: 'Report context',
		components: [
			labelComponent(
				'Short reason',
				textInput('report_reason', TEXT_INPUT_SHORT, {
					minLength: 3,
					maxLength: 80,
				}),
				'Example: cheating, griefing, boosting, throwing',
			),
			labelComponent(
				'What happened?',
				textInput('report_details', TEXT_INPUT_PARAGRAPH, {
					minLength: 20,
					maxLength: 1e3,
				}),
				'Keep it specific. Staff gets proof plus this note.',
			),
		],
	});
}

function openPrefilledReportModal(playerLookup, playerLabel) {
	return modalResponse({
		custom_id: customId('report', 'profile', playerLookup),
		title: `Report ${playerLabel}`.slice(0, 45),
		components: [
			labelComponent(
				'Evidence link',
				textInput('report_evidence_url', TEXT_INPUT_SHORT, {
					minLength: 8,
					maxLength: 300,
				}),
				'Paste an image or video URL. Use /report if you want to upload proof directly.',
			),
			labelComponent(
				'Short reason',
				textInput('report_reason', TEXT_INPUT_SHORT, {
					minLength: 3,
					maxLength: 80,
				}),
				'Example: cheating, griefing, boosting, throwing',
			),
			labelComponent(
				'What happened?',
				textInput('report_details', TEXT_INPUT_PARAGRAPH, {
					minLength: 20,
					maxLength: 1e3,
				}),
				'Keep it specific. Staff gets proof plus this note.',
			),
		],
	});
}

function reportReviewModal(reportId, action) {
	const approving = action === 'accept';
	return modalResponse({
		custom_id: `report_review:${action}:${reportId}`,
		title: approving ? 'Approve report' : 'Decline report',
		components: [
			labelComponent(
				approving ? 'Public reason' : 'Decision reason',
				textInput('report_public_reason', TEXT_INPUT_SHORT, {
					minLength: 3,
					maxLength: 80,
				}),
				approving
					? 'This is what future /stats and /profile output will show.'
					: 'Use a clean label like Not enough evidence, Wrong player, Clip too short, or Already handled.',
			),
			labelComponent(
				'Reviewer note',
				textInput('report_reviewer_note', TEXT_INPUT_PARAGRAPH, {
					minLength: 8,
					maxLength: 1e3,
				}),
				'What convinced you? This stays on the reviewed staff embed.',
			),
		],
	});
}

function reportButtons(reportId, disabled = false) {
	return [
		actionRow([
			button(`report_accept:${reportId}`, 'Approve report', BUTTON_SECONDARY, disabled),
			button(`report_reject:${reportId}`, 'Decline report', BUTTON_SECONDARY, disabled),
		]),
	];
}

function reportStatusLabel(status) {
	if (status === 'accepted') return 'Accepted';
	if (status === 'rejected') return 'Declined';
	return 'Pending review';
}

function reportReviewChannelAllowed(interaction, env) {
	const supportReportChannelId = env.SUPPORT_REPORT_CHANNEL_ID?.trim();
	return Boolean(supportReportChannelId && interaction.channel_id === supportReportChannelId);
}

function reportReviewChannelDeniedResponse() {
	return interactionResponse(simpleErrorMessage('Review unavailable', 'Report reviews only work in the configured staff channel.'));
}

function reportReviewMessage(report, options = {}) {
	const rankedStats = options.profile ? latestSeason(options.profile)?.ranked : undefined;
	const lastOnline = options.profile ? formatLastOnline(options.profile) : undefined;
	const accent = report.status === 'accepted' ? UI_ACCENT_SUCCESS : report.status === 'rejected' ? UI_ACCENT_DANGER : UI_ACCENT_WARNING;
	const children = [
		textDisplay(
			[
				`## Report: ${report.targetName}`,
				`Status: **${reportStatusLabel(report.status)}**`,
				bulletList([
					`Player ID: \`${report.targetPlayerId}\``,
					`Reporter: <@${report.reporterId}>`,
					options.reporterReputation
						? `Reporter tier: **${reporterTierLabel(options.reporterReputation.tier)}** (${options.reporterReputation.acceptedReports} accepted, ${options.reporterReputation.rejectedReports} declined, ${options.reporterReputation.banConfirmedReports} ban confirmed)`
						: undefined,
					proofLine(report.proof),
					report.patternSignal
						? `Signal: **multiple independent reports** from ${report.patternSignal.trustedReporterCount} trusted reporters`
						: undefined,
					report.createdAt ? `Submitted: ${report.createdAt}` : undefined,
				]),
			].join('\n'),
		),
		separator(),
		textDisplay(
			['**Reporter summary**', report.reason, '', '**Details**', (report.details || 'No extra details were submitted.').slice(0, 1e3)].join(
				'\n',
			),
		),
	];
	if (options.profile) {
		children.push(
			separator(false),
			textDisplay(
				[
					'**Current ranked context**',
					bulletList([
						`Rank: ${rankName(options.profile.stats?.ranked)}`,
						`Peak: ${peakRankName(options.profile.stats?.ranked) || 'Unknown'}`,
						lastOnline ? `Last online: ${lastOnline}` : undefined,
						`MMR: ${formatOptionalInteger(options.profile.stats?.ranked?.mmr)}`,
						...formatStats(rankedStats).split('\n'),
					]),
				].join('\n'),
			),
		);
	}
	if (report.publicReason || report.reviewerNote) {
		children.push(
			separator(false),
			textDisplay(
				[
					'**Review outcome**',
					bulletList([
						report.publicReason ? `Reason: **${report.publicReason}**` : undefined,
						report.reviewedBy ? `Reviewer: <@${report.reviewedBy}>` : undefined,
						report.reviewedAt ? `Reviewed: <t:${Math.floor(Date.parse(report.reviewedAt) / 1e3)}:R>` : undefined,
					]),
					'',
					'**Reviewer note**',
					report.reviewerNote || 'No reviewer note was added.',
				].join('\n'),
			),
		);
	}
	children.push(separator(), ...reportButtons(report.id, options.disabled));
	return v2Message([
		container(children, {
			accentColor: accent,
		}),
	]);
}

async function handleReportReview(interaction, env) {
	if (!reportReviewChannelAllowed(interaction, env)) {
		return reportReviewChannelDeniedResponse();
	}
	const customIdValue = interaction.data?.custom_id || '';
	const reportId = customIdValue.replace(/^report_(accept|reject):/, '');
	try {
		const report = await getPendingReport(env, reportId);
		if (!report) {
			return interactionResponse(
				simpleErrorMessage('Report unavailable', 'That report is not in the queue anymore. Someone may have already handled it.'),
			);
		}
		return reportReviewModal(reportId, customIdValue.startsWith('report_accept:') ? 'accept' : 'reject');
	} catch (error) {
		console.error('Failed to open report review modal', {
			reportId,
			error,
		});
		return interactionResponse(
			simpleErrorMessage('Review unavailable', 'The review form is not opening right now. Give it a moment and try again.'),
		);
	}
}

async function handleReportReviewModal(interaction, env, runtime) {
	if (!reportReviewChannelAllowed(interaction, env)) {
		return reportReviewChannelDeniedResponse();
	}
	const customIdValue = interaction.data?.custom_id || '';
	const [, action, reportId] = customIdValue.match(/^report_review:(accept|reject):(.+)$/) || [];
	const reviewerId = interactionUserId(interaction) || 'unknown';
	const publicReason = cleanModalText(modalValue(interaction, 'report_public_reason'));
	const reviewerNote = cleanParagraph(modalValue(interaction, 'report_reviewer_note'));
	if (!reportId || (action !== 'accept' && action !== 'reject')) {
		return interactionResponse(
			simpleErrorMessage('Review unavailable', 'That review form came back scrambled. Open the report again and try once more.'),
		);
	}
	if (!publicReason || !reviewerNote) {
		return interactionResponse(simpleErrorMessage('Review incomplete', 'Give staff the short reason and the note.'));
	}
	try {
		const report = await getPendingReport(env, reportId);
		if (!report) {
			return interactionResponse(
				simpleErrorMessage('Report unavailable', 'That report is not in the queue anymore. Someone may have already handled it.'),
			);
		}
		const reviewed =
			action === 'accept'
				? await acceptReport(env, report, reviewerId, publicReason, reviewerNote)
				: await rejectReport(env, report, reviewerId, publicReason, reviewerNote);
		if (action === 'accept') {
			await clearPlayerCardLookupCaches(env, [report.targetPlayerId, report.targetName]);
		}
		const reporterReputation = await getReporterReputation(env, reviewed.reporterId);
		if (runtime?.waitUntil) {
			runtime.waitUntil(
				sendReportDecisionDm(env, reviewed, action === 'accept').catch((error) => {
					console.error('Failed to DM report review outcome', {
						reportId,
						reporterId: reviewed.reporterId,
						error,
					});
				}),
			);
			runtime.waitUntil(refreshStaffReviewAnalytics(env));
		}
		return updateMessageResponse(
			reportReviewMessage(reviewed, {
				disabled: true,
				reporterReputation,
			}),
		);
	} catch (error) {
		console.error('Failed to review report', {
			reportId,
			reviewerId,
			error,
		});
		return interactionResponse(
			simpleErrorMessage('Review unavailable', 'The review form is not saving right now. Give it a moment and try again.'),
		);
	}
}

async function editReportSubmitResponse(interaction, env, draft, reason, details, supportReportChannelId, waitUntil) {
	try {
		const profile = await fetchProfileByPlayerOption(draft.player);
		if (!profile || !playerId(profile)) {
			await editOriginalInteractionResponse(
				env,
				interaction.token,
				simpleErrorMessage('Player not found', "I couldn't find that player. Check the spelling or ID and send the report again."),
			);
			return;
		}
		recordProfileLookupSoon(env, profile, waitUntil, draft.reporterId, draft.player);
		const targetPlayerId = playerId(profile);
		if (!targetPlayerId) {
			await editOriginalInteractionResponse(
				env,
				interaction.token,
				simpleErrorMessage(
					'Report unavailable',
					'I found the player, but their ID did not come through cleanly. Try once more with the player ID.',
				),
			);
			return;
		}
		const existingAccepted = await getAcceptedReport(env, targetPlayerId);
		if (existingAccepted) {
			const reportId = crypto.randomUUID();
			const now = /* @__PURE__ */ new Date().toISOString();
			const report2 = {
				id: reportId,
				reporterId: draft.reporterId,
				targetPlayerId,
				targetName: displayName(profile),
				reason,
				details,
				proof: draft.proof,
				status: 'accepted',
				createdAt: now,
				reviewedBy: existingAccepted.acceptedBy || 'automated',
				reviewedAt: now,
				publicReason: existingAccepted.reason,
				reviewerNote: existingAccepted.reviewerNote || 'Report automatically accepted because the user was already flagged and accepted.',
			};
			existingAccepted.duplicateReports = existingAccepted.duplicateReports || [];
			if (
				!existingAccepted.duplicateReports.some((dup) => dup.reporterId === draft.reporterId) &&
				existingAccepted.reporterId !== draft.reporterId
			) {
				existingAccepted.duplicateReports.push({
					reportId,
					reporterId: draft.reporterId,
					submittedAt: now,
				});
			}
			const reporterReputation2 = await recordAutomaticallyAcceptedReport(env, draft.reporterId, now);
			await Promise.all([
				putPendingReport(env, report2),
				putAcceptedReport(env, existingAccepted),
				putReportCooldown(env, draft.reporterId, REPORT_COOLDOWN_SECONDS),
				deleteReportDraft(env, draft.id),
			]);
			await editOriginalInteractionResponse(
				env,
				interaction.token,
				reportReceiptMessage({
					env,
					report: report2,
					reputation: reporterReputation2,
				}),
			);
			waitUntil?.(sendReportDecisionDm(env, report2, true));
			return;
		}
		const patternSignal = await suspiciousPatternForReport(env, targetPlayerId, draft.reporterId);
		const report = await createPendingReport(env, {
			id: crypto.randomUUID(),
			reporterId: draft.reporterId,
			targetPlayerId,
			targetName: displayName(profile),
			reason,
			details,
			proof: draft.proof,
			patternSignal,
		});
		const reporterReputation = await getReporterReputation(env, draft.reporterId);
		try {
			await sendDiscordMessage(
				env,
				supportReportChannelId,
				reportReviewMessage(report, {
					profile,
					reporterReputation,
				}),
			);
		} catch (sendError) {
			console.error('Failed to send report to support channel', {
				supportReportChannelId,
				reportId: report.id,
				reporterId: draft.reporterId,
				targetPlayerId: report.targetPlayerId,
				error: sendError,
			});
			await editOriginalInteractionResponse(
				env,
				interaction.token,
				simpleErrorMessage(
					'Staff channel unavailable',
					'I saved the report, but the staff channel did not accept the message. The bot owner should check the channel ID and permissions.',
				),
			);
			return;
		}
		await Promise.all([putReportCooldown(env, draft.reporterId, REPORT_COOLDOWN_SECONDS), deleteReportDraft(env, draft.id)]);
		await editOriginalInteractionResponse(
			env,
			interaction.token,
			reportReceiptMessage({
				env,
				report,
				reputation: reporterReputation,
			}),
		);
		waitUntil?.(refreshStaffReviewAnalytics(env));
	} catch (error) {
		console.error('Failed to submit report', {
			reporterId: draft.reporterId,
			player: draft.player,
			error,
		});
		await editOriginalInteractionResponse(
			env,
			interaction.token,
			simpleErrorMessage('Reports unavailable', 'The report desk is not taking new notes right now. Give it a bit and try again.'),
		);
	}
}

function reportProofFromUrl(url) {
	try {
		const parsed = new URL(url);
		if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
			return undefined;
		}
		return {
			url: parsed.toString(),
			filename: parsed.pathname.split('/').filter(Boolean).at(-1) || 'evidence link',
		};
	} catch {
		return undefined;
	}
}

async function handlePrefilledReportModal(interaction, env, runtime) {
	const reporterId = interactionUserId(interaction);
	const player = parseCustomId(interaction.data?.custom_id)?.args.join(':') || '';
	const evidenceUrl = cleanModalText(modalValue(interaction, 'report_evidence_url'));
	const reason = cleanModalText(modalValue(interaction, 'report_reason'));
	const details = cleanParagraph(modalValue(interaction, 'report_details'));
	const supportReportChannelId = env.SUPPORT_REPORT_CHANNEL_ID?.trim();
	const proof = reportProofFromUrl(evidenceUrl);
	if (!reporterId) {
		return interactionResponse(
			simpleErrorMessage('Report unavailable', "I can't tell who is sending this report. Try again from your own Discord account."),
		);
	}
	if (!player || !reason || !details || !proof) {
		return interactionResponse(simpleErrorMessage('Report incomplete', 'Add a valid evidence link, a short reason, and the details.'));
	}
	if (!env.USER_PREFERENCES || !discordBotToken(env) || !supportReportChannelId) {
		return interactionResponse(
			simpleErrorMessage(
				'Reports unavailable',
				'Reports need storage, a bot token, and a staff channel before they can land anywhere useful.',
			),
		);
	}
	const blacklist = await getReportBlacklistEntry(env, reporterId);
	if (blacklist) {
		return interactionResponse(
			simpleErrorMessage('Reports paused', 'Your report button is taking a staff-enforced nap. Ask the team if you think that changed.'),
		);
	}
	const cooldown = await getReportCooldown(env, reporterId);
	if (cooldown) {
		return interactionResponse(simpleErrorMessage('Slow down', cooldownMessage(cooldown.retryAt)));
	}
	const draft = {
		id: crypto.randomUUID(),
		reporterId,
		player,
		proof,
		createdAt: /* @__PURE__ */ new Date().toISOString(),
	};
	runInBackground(runtime, () =>
		editReportSubmitResponse(interaction, env, draft, reason, details, supportReportChannelId, runtime?.waitUntil?.bind(runtime)),
	);
	return deferredInteractionResponse({ flags: EPHEMERAL });
}

async function handleReportSubmitModal(interaction, env, runtime) {
	const draftId = (interaction.data?.custom_id || '').replace('report_submit:', '');
	const reporterId = interactionUserId(interaction);
	const reason = cleanModalText(modalValue(interaction, 'report_reason'));
	const details = cleanParagraph(modalValue(interaction, 'report_details'));
	const supportReportChannelId = env.SUPPORT_REPORT_CHANNEL_ID?.trim();
	if (!reporterId) {
		return interactionResponse(
			simpleErrorMessage('Report unavailable', "I can't tell who is sending this report. Try again from your own Discord account."),
		);
	}
	if (!reason || !details) {
		return interactionResponse(simpleErrorMessage('Report incomplete', 'Give staff the short reason and what happened.'));
	}
	if (!env.USER_PREFERENCES || !discordBotToken(env) || !supportReportChannelId) {
		return interactionResponse(
			simpleErrorMessage(
				'Reports unavailable',
				'Reports need storage, a bot token, and a staff channel before they can land anywhere useful.',
			),
		);
	}
	const draft = await getReportDraft(env, draftId);
	if (!draft || draft.reporterId !== reporterId) {
		return interactionResponse(
			simpleErrorMessage('Report expired', 'That report form expired. Run `/report` again and I\u2019ll hand you a fresh one.'),
		);
	}
	const blacklist = await getReportBlacklistEntry(env, reporterId);
	if (blacklist) {
		return interactionResponse(
			simpleErrorMessage('Reports paused', 'Your report button is taking a staff-enforced nap. Ask the team if you think that changed.'),
		);
	}
	const cooldown = await getReportCooldown(env, reporterId);
	if (cooldown) {
		return interactionResponse(simpleErrorMessage('Slow down', cooldownMessage(cooldown.retryAt)));
	}
	runInBackground(runtime, () =>
		editReportSubmitResponse(interaction, env, draft, reason, details, supportReportChannelId, runtime?.waitUntil?.bind(runtime)),
	);
	return deferredInteractionResponse({ flags: EPHEMERAL });
}

async function handle(interaction, env) {
	const reporterId = interactionUserId(interaction);
	const player = optionValue(interaction.data?.options, 'player');
	const proofAttachment = optionAttachment(interaction, 'proof');
	const proof = proofAttachment ? proofFromAttachment(proofAttachment) : undefined;
	const supportReportChannelId = env.SUPPORT_REPORT_CHANNEL_ID?.trim();
	if (!reporterId) {
		return interactionResponse(
			simpleErrorMessage('Report unavailable', "I can't tell who is sending this report. Try again from your own Discord account."),
		);
	}
	if (!player || !proofAttachment) {
		return interactionResponse(
			simpleErrorMessage('Report incomplete', 'Give staff a player and proof: `/report player:<name-or-id> proof:<image-or-video>`.'),
		);
	}
	if (!isProofAttachment(proofAttachment) || !proof) {
		return interactionResponse(simpleErrorMessage('Invalid proof', 'Proof needs to be an image or video.'));
	}
	if (!env.USER_PREFERENCES) {
		return interactionResponse(
			simpleErrorMessage('Reports unavailable', 'Reports need storage before staff can review them. Ask the bot owner to hook up KV.'),
		);
	}
	if (!discordBotToken(env)) {
		return interactionResponse(
			simpleErrorMessage('Reports unavailable', 'Reports need the bot token before they can reach staff. Bot owner setup time.'),
		);
	}
	if (!supportReportChannelId) {
		return interactionResponse(
			simpleErrorMessage('Reports unavailable', 'Reports need a staff channel before they can land anywhere useful.'),
		);
	}
	const blacklist = await getReportBlacklistEntry(env, reporterId);
	if (blacklist) {
		return interactionResponse(
			simpleErrorMessage('Reports paused', 'Your report button is taking a staff-enforced nap. Ask the team if you think that changed.'),
		);
	}
	const cooldown = await getReportCooldown(env, reporterId);
	if (cooldown) {
		return interactionResponse(simpleErrorMessage('Slow down', cooldownMessage(cooldown.retryAt)));
	}
	const draft = await createReportDraft(env, {
		id: crypto.randomUUID(),
		reporterId,
		player,
		proof,
	});
	return reportSubmitModal(draft.id);
}

const reportCommand = {
	definition,
	handle: handle,
};

export {
	handlePrefilledReportModal,
	handleReportReview,
	handleReportReviewModal,
	handleReportSubmitModal,
	openPrefilledReportModal,
	reportCommand,
};
