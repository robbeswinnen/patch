// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.
import { reportReceiptMessage } from './app-ui';
import { displayName, fetchProfileByPlayerOption, hasActiveBan } from './cops';
import { discordBotToken, sendDiscordDm } from './discord';
import { refreshStaffReviewAnalytics } from './reporting';
import {
	getPendingReport,
	getReporterReputation,
	listAcceptedReports,
	markPendingReportBanConfirmed,
	putAcceptedReport,
	recordReportBanConfirmed,
} from './storage';

const BAN_WATCH_RECHECK_MS = 6 * 60 * 60 * 1e3;
const MAX_BAN_WATCH_CHECKS_PER_RUN = 20;
function recentEnough(isoDate, now) {
	if (!isoDate) {
		return false;
	}
	const checkedAt = Date.parse(isoDate);
	return Number.isFinite(checkedAt) && now.getTime() - checkedAt < BAN_WATCH_RECHECK_MS;
}

function buildReportDecisionMessage(options) {
	return reportReceiptMessage({
		env: options.env,
		report: options.report,
		reputation: options.reputation,
	});
}

function buildReportBanMessage(options) {
	return reportReceiptMessage({
		env: options.env,
		report: options.report,
		reputation: options.reputation,
	});
}

async function sendReportDecisionDm(env, report, _accepted) {
	if (!discordBotToken(env)) {
		return;
	}
	const reputation = await getReporterReputation(env, report.reporterId);
	await sendDiscordDm(
		env,
		report.reporterId,
		buildReportDecisionMessage({
			env,
			report,
			reputation,
		}),
	);
}

async function sendReportBanDm(env, report, confirmedReport) {
	if (!discordBotToken(env)) {
		return;
	}
	const pending = confirmedReport ||
		(await getPendingReport(env, report.reportId)) || {
			id: report.reportId,
			status: 'ban_confirmed',
			reporterId: report.reporterId,
			targetPlayerId: report.playerId,
			targetName: report.playerName,
			reason: report.reason,
			publicReason: report.reason,
			createdAt: report.acceptedAt || /* @__PURE__ */ new Date().toISOString(),
			reviewedAt: report.acceptedAt,
			reviewedBy: report.acceptedBy,
			reviewerNote: report.reviewerNote,
			banConfirmedAt: report.banDetectedAt,
		};
	const reputation = await getReporterReputation(env, report.reporterId);
	await sendDiscordDm(
		env,
		report.reporterId,
		buildReportBanMessage({
			env,
			report: pending,
			reputation,
		}),
	);
}

async function runBanWatcher(env, now = /* @__PURE__ */ new Date()) {
	const result = {
		checked: 0,
		banned: 0,
		notified: 0,
		skipped: 0,
	};
	if (!env.USER_PREFERENCES || !discordBotToken(env)) {
		return result;
	}
	const reports = await listAcceptedReports(env);
	for (const report of reports) {
		if (report.banNotifiedAt || recentEnough(report.banLastCheckedAt, now)) {
			result.skipped += 1;
			continue;
		}
		if (result.checked >= MAX_BAN_WATCH_CHECKS_PER_RUN) {
			result.skipped += 1;
			continue;
		}
		result.checked += 1;
		try {
			const profile = await fetchProfileByPlayerOption(report.playerId);
			const checkedReport = {
				...report,
				playerName: profile ? displayName(profile) : report.playerName,
				banLastCheckedAt: now.toISOString(),
			};
			if (!profile || !hasActiveBan(profile.ban)) {
				await putAcceptedReport(env, checkedReport);
				continue;
			}
			result.banned += 1;
			const confirmedAt = now.toISOString();
			const detectedReport = {
				...checkedReport,
				banDetectedAt: confirmedAt,
			};
			const confirmedPending = await markPendingReportBanConfirmed(env, report.reportId, confirmedAt);
			if (!confirmedPending && !report.banDetectedAt) {
				await recordReportBanConfirmed(env, report.reporterId, confirmedAt);
			}
			try {
				await sendReportBanDm(env, detectedReport, confirmedPending);
				result.notified += 1;
			} catch (dmError) {
				console.error('Failed to notify primary reporter', dmError);
			}
			if (report.duplicateReports && report.duplicateReports.length > 0) {
				for (const dup of report.duplicateReports) {
					try {
						const dupConfirmedPending = await markPendingReportBanConfirmed(env, dup.reportId, confirmedAt);
						const dupPlayerReport = {
							...detectedReport,
							reporterId: dup.reporterId,
							reportId: dup.reportId,
						};
						await sendReportBanDm(env, dupPlayerReport, dupConfirmedPending);
						result.notified += 1;
					} catch (dupError) {
						console.error('Failed to notify duplicate reporter', {
							reporterId: dup.reporterId,
							error: dupError,
						});
					}
				}
			}
			await putAcceptedReport(env, {
				...detectedReport,
				banNotifiedAt: confirmedAt,
			});
			await refreshStaffReviewAnalytics(env);
		} catch (error) {
			console.error('Ban watcher failed for accepted report', {
				reportId: report.reportId,
				playerId: report.playerId,
				reporterId: report.reporterId,
				error,
			});
		}
	}
	return result;
}

export { runBanWatcher, sendReportDecisionDm };
