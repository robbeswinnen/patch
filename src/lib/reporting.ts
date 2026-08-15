// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.
import { communityRecapMessage } from './app-ui';
import { discordBotToken, sendDiscordMessage } from './discord';
import { getMonthlyCommunityRecap, listAcceptedReports, listReports, listTrackers, putMonthlyCommunityRecap } from './storage';
import { trackingChanges } from './tracking';

function monthId(date) {
	return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function previousMonthRange(now) {
	const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
	const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
	return {
		month: monthId(start),
		start,
		end,
	};
}

function inRange(isoDate, start, end) {
	if (!isoDate) {
		return false;
	}
	const parsedTimestamp = Date.parse(isoDate);
	return Number.isFinite(parsedTimestamp) && parsedTimestamp >= start.getTime() && parsedTimestamp < end.getTime();
}

async function refreshStaffReviewAnalytics(env) {}

async function buildMonthlyCommunityRecap(env, now = /* @__PURE__ */ new Date()) {
	const { month, start, end } = previousMonthRange(now);
	const [reports, acceptedReports, trackers] = await Promise.all([
		env.USER_PREFERENCES ? listReports(env) : Promise.resolve([]),
		env.USER_PREFERENCES ? listAcceptedReports(env) : Promise.resolve([]),
		env.USER_PREFERENCES ? listTrackers(env) : Promise.resolve([]),
	]);
	const reviewedReports = reports.filter((report) => inRange(report.reviewedAt, start, end));
	const accepted = reviewedReports.filter((report) => report.status === 'accepted' || report.status === 'ban_confirmed');
	const declined = reviewedReports.filter((report) => report.status === 'rejected');
	const confirmedReportIds = /* @__PURE__ */ new Set();
	for (const report of reports) {
		if (inRange(report.banConfirmedAt, start, end)) {
			confirmedReportIds.add(report.id);
		}
	}
	for (const report of acceptedReports) {
		if (inRange(report.banDetectedAt, start, end)) {
			confirmedReportIds.add(report.reportId);
		}
	}
	const movements = /* @__PURE__ */ new Map();
	for (const tracker of trackers) {
		for (const change of trackingChanges(tracker)) {
			const mmrDelta = change.delta.mmr;
			if (!change.latest || typeof mmrDelta !== 'number' || mmrDelta <= 0) {
				continue;
			}
			if (!inRange(change.latest.capturedAt, start, end)) {
				continue;
			}
			const key = change.player.playerId || change.player.key;
			const existing = movements.get(key);
			if (!existing || (existing.mmrDelta || 0) < mmrDelta) {
				movements.set(key, {
					playerKey: key,
					playerName: change.player.label,
					mmrDelta,
					rank: change.latest.rank,
					capturedAt: change.latest.capturedAt,
				});
			}
		}
	}
	return {
		month,
		generatedAt: now.toISOString(),
		reportsReviewed: reviewedReports.length,
		reportsAccepted: accepted.length,
		reportsDeclined: declined.length,
		bansConfirmed: confirmedReportIds.size,
		topRankMovements: Array.from(movements.values())
			.sort((a, b) => (b.mmrDelta || 0) - (a.mmrDelta || 0) || a.playerName.localeCompare(b.playerName))
			.slice(0, 5),
	};
}

async function updateMonthlyCommunityRecapBaseline(env, now = /* @__PURE__ */ new Date()) {
	if (!env.USER_PREFERENCES || now.getUTCDate() !== 1) {
		return undefined;
	}
	const { month } = previousMonthRange(now);
	const existing = await getMonthlyCommunityRecap(env, month);
	if (existing) {
		return existing;
	}
	const recap = await buildMonthlyCommunityRecap(env, now);
	await putMonthlyCommunityRecap(env, recap);
	return recap;
}

async function sendMonthlyCommunityRecap(env, now = /* @__PURE__ */ new Date()) {
	const channelId = env.SUPPORT_REPORT_CHANNEL_ID?.trim();
	if (!channelId || !discordBotToken(env)) {
		return {
			sent: false,
			recap: await buildMonthlyCommunityRecap(env, now),
		};
	}
	const recap = await buildMonthlyCommunityRecap(env, now);
	await putMonthlyCommunityRecap(env, recap);
	await sendDiscordMessage(env, channelId, communityRecapMessage(recap));
	return {
		sent: true,
		recap,
	};
}

export { refreshStaffReviewAnalytics, sendMonthlyCommunityRecap, updateMonthlyCommunityRecapBaseline };
