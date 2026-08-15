// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.
import { displayName, latestSeason, peakRankName, playerId, profileLastOnlineIso, rankName } from './cops';
import { normalizePlayerTagIds } from './player-tags';

function requireKv(env) {
	if (!env.USER_PREFERENCES) {
		throw new Error('Missing USER_PREFERENCES KV binding');
	}
	return env.USER_PREFERENCES;
}

function trackerKey(userId) {
	return `track:${userId}`;
}

function acceptedReportKey(targetPlayerId) {
	return `report:accepted:${targetPlayerId}`;
}

function playerTagsKey(targetPlayerId) {
	return `player:tags:${targetPlayerId}`;
}

function playerLookupCountKey(targetPlayerId) {
	return `player:lookup-count:${targetPlayerId}`;
}

function onboardingKey(userId) {
	return `onboarding:${userId}`;
}

function pendingReportKey(reportId) {
	return `report:pending:${reportId}`;
}

function reportDraftKey(reportId) {
	return `report:draft:${reportId}`;
}

function reportBlacklistKey(userId) {
	return `report:blacklist:${userId}`;
}

function reportCooldownKey(userId) {
	return `report:cooldown:${userId}`;
}

function reporterReputationKey(userId) {
	return `report:reputation:${userId}`;
}

function monthlyCommunityRecapKey(month) {
	return `community:recap:${month}`;
}

function reporterTierLabel(tier) {
	if (tier === 'trusted_reporter') return 'Trusted Reporter';
	if (tier === 'community_scout') return 'Community Scout';
	if (tier === 'evidence_builder') return 'Evidence Builder';
	return 'New Reporter';
}

function emptyReporterReputation(userId) {
	return {
		userId,
		submittedReports: 0,
		acceptedReports: 0,
		rejectedReports: 0,
		banConfirmedReports: 0,
		tier: 'new_reporter',
		updatedAt: /* @__PURE__ */ new Date().toISOString(),
	};
}

function normalizeReportStatus(status) {
	if (status === 'pending' || status === 'accepted' || status === 'rejected' || status === 'ban_confirmed') {
		return status;
	}
	return 'pending';
}

function normalizePendingReport(report) {
	return {
		...report,
		status: normalizeReportStatus(report.status),
	};
}

function computeReporterTier(record) {
	const accepted = Math.max(0, Math.floor(record.acceptedReports || 0));
	const rejected = Math.max(0, Math.floor(record.rejectedReports || 0));
	const banConfirmed = Math.max(0, Math.floor(record.banConfirmedReports || 0));
	if (rejected >= 3 && rejected > accepted + banConfirmed) {
		return 'evidence_builder';
	}
	if (banConfirmed >= 2 || (accepted >= 5 && accepted >= rejected + 2)) {
		return 'trusted_reporter';
	}
	if (banConfirmed >= 1 || accepted >= 2) {
		return 'community_scout';
	}
	return 'new_reporter';
}

function normalizeReporterReputation(record) {
	const normalized = {
		...emptyReporterReputation(record.userId),
		...record,
		submittedReports: Math.max(0, Math.floor(record.submittedReports || 0)),
		acceptedReports: Math.max(0, Math.floor(record.acceptedReports || 0)),
		rejectedReports: Math.max(0, Math.floor(record.rejectedReports || 0)),
		banConfirmedReports: Math.max(0, Math.floor(record.banConfirmedReports || 0)),
	};
	return {
		...normalized,
		tier: computeReporterTier(normalized),
	};
}

function reporterReputationFromReports(userId, reports) {
	const record = emptyReporterReputation(userId);
	for (const report of reports) {
		if (report.reporterId !== userId) {
			continue;
		}
		record.submittedReports += 1;
		record.lastReportAt = [record.lastReportAt, report.createdAt].filter(Boolean).sort().at(-1);
		if (report.status === 'accepted' || report.status === 'ban_confirmed') {
			record.acceptedReports += 1;
			record.lastAcceptedAt = [record.lastAcceptedAt, report.reviewedAt].filter(Boolean).sort().at(-1);
		}
		if (report.status === 'rejected') {
			record.rejectedReports += 1;
			record.lastRejectedAt = [record.lastRejectedAt, report.reviewedAt].filter(Boolean).sort().at(-1);
		}
		if (report.status === 'ban_confirmed' || report.banConfirmedAt) {
			record.banConfirmedReports += 1;
			record.lastBanConfirmedAt = [record.lastBanConfirmedAt, report.banConfirmedAt].filter(Boolean).sort().at(-1);
		}
	}
	return normalizeReporterReputation(record);
}

function reporterIsTrustedForSignals(reputation) {
	return reputation?.tier === 'community_scout' || reputation?.tier === 'trusted_reporter';
}

async function getTracker(env, userId) {
	const stored = await requireKv(env).get(trackerKey(userId), 'json');
	if (stored && typeof stored === 'object') {
		return normalizeTrackerRecord(stored);
	}
	return {
		userId,
		players: [],
		updatedAt: /* @__PURE__ */ new Date().toISOString(),
	};
}

async function putTracker(env, record) {
	await requireKv(env).put(
		trackerKey(record.userId),
		JSON.stringify({
			...record,
			updatedAt: /* @__PURE__ */ new Date().toISOString(),
		}),
	);
}

function normalizeTrackedPlayer(player) {
	const latestSnapshot = player.latestSnapshot || player.lastSnapshot;
	const baselineSnapshot = player.baselineSnapshot || player.lastSnapshot || latestSnapshot;
	return {
		...player,
		latestSnapshot,
		baselineSnapshot,
		lastSnapshot: latestSnapshot,
		lastRefreshedAt: player.lastRefreshedAt || latestSnapshot?.capturedAt,
		lastViewedAt: player.lastViewedAt || baselineSnapshot?.capturedAt,
	};
}

function normalizeTrackerRecord(record) {
	return {
		...record,
		players: (record.players || []).map(normalizeTrackedPlayer),
		lastRefreshedAt:
			record.lastRefreshedAt ||
			record.players
				?.map((player) => player.lastRefreshedAt || player.lastSnapshot?.capturedAt)
				.filter(Boolean)
				.sort()
				.at(-1),
		lastViewedAt:
			record.lastViewedAt ||
			record.players
				?.map((player) => player.lastViewedAt || player.lastSnapshot?.capturedAt)
				.filter(Boolean)
				.sort()
				.at(-1),
	};
}

async function getOnboardingRecord(env, userId) {
	if (!env.USER_PREFERENCES) {
		return undefined;
	}
	const record = await env.USER_PREFERENCES.get(onboardingKey(userId), 'json');
	return record && typeof record === 'object' ? record : undefined;
}

async function markOnboardingStarted(env, userId, firstCommand) {
	const record = {
		userId,
		firstCommand,
		startedAt: /* @__PURE__ */ new Date().toISOString(),
	};
	await requireKv(env).put(onboardingKey(userId), JSON.stringify(record));
	return record;
}

async function listTrackers(env) {
	const kv = requireKv(env);
	const records = [];
	let cursor;
	do {
		const page = await kv.list({ prefix: 'track:', cursor });
		await Promise.all(
			page.keys.map(async (key) => {
				const record = await kv.get(key.name, 'json');
				if (record && typeof record === 'object') {
					records.push(record);
				}
			}),
		);
		cursor = page.list_complete ? undefined : page.cursor;
	} while (cursor);
	return records;
}

function snapshotProfile(profile) {
	const season = latestSeason(profile);
	return {
		capturedAt: /* @__PURE__ */ new Date().toISOString(),
		season: season?.season,
		kills: Number(season?.ranked?.k || 0),
		deaths: Number(season?.ranked?.d || 0),
		mmr: profile.stats?.ranked?.mmr,
		rank: rankName(profile.stats?.ranked),
		peakRank: peakRankName(profile.stats?.ranked),
		lastOnlineAt: profileLastOnlineIso(profile),
		level: profile.basicInfo?.playerLevel?.level,
	};
}

function trackedPlayerFromProfile(lookup, profile) {
	const id = playerId(profile);
	const snapshot = snapshotProfile(profile);
	return {
		key: id || lookup.toLowerCase(),
		lookup: id || lookup,
		label: displayName(profile),
		playerId: id,
		latestSnapshot: snapshot,
		baselineSnapshot: snapshot,
		lastSnapshot: snapshot,
		addedAt: /* @__PURE__ */ new Date().toISOString(),
		lastViewedAt: snapshot.capturedAt,
		lastRefreshedAt: snapshot.capturedAt,
	};
}

function snapshotDelta(previous, next) {
	const diff = (a, b) => (typeof a === 'number' && typeof b === 'number' ? b - a : undefined);
	return {
		kills: diff(previous?.kills, next.kills),
		deaths: diff(previous?.deaths, next.deaths),
		mmr: diff(previous?.mmr, next.mmr),
		level: diff(previous?.level, next.level),
		rankChanged: previous?.rank && previous.rank !== next.rank,
	};
}

async function createPendingReport(env, report) {
	const pending = {
		...report,
		status: 'pending',
		createdAt: /* @__PURE__ */ new Date().toISOString(),
	};
	await recordReportSubmitted(env, pending.reporterId, pending.createdAt);
	await requireKv(env).put(pendingReportKey(report.id), JSON.stringify(pending));
	return pending;
}

async function createReportDraft(env, draft) {
	const stored = {
		...draft,
		createdAt: /* @__PURE__ */ new Date().toISOString(),
	};
	await requireKv(env).put(reportDraftKey(stored.id), JSON.stringify(stored), {
		expirationTtl: 15 * 60,
	});
	return stored;
}

async function getReportDraft(env, draftId) {
	const draft = await requireKv(env).get(reportDraftKey(draftId), 'json');
	return draft && typeof draft === 'object' ? draft : undefined;
}

async function deleteReportDraft(env, draftId) {
	await requireKv(env).delete(reportDraftKey(draftId));
}

async function getPendingReport(env, reportId) {
	const report = await requireKv(env).get(pendingReportKey(reportId), 'json');
	return report && typeof report === 'object' ? normalizePendingReport(report) : undefined;
}

async function putPendingReport(env, report) {
	await requireKv(env).put(pendingReportKey(report.id), JSON.stringify(normalizePendingReport(report)));
}

async function listReports(env) {
	const kv = requireKv(env);
	const reports = [];
	let cursor;
	do {
		const page = await kv.list({ prefix: 'report:pending:', cursor });
		await Promise.all(
			page.keys.map(async (key) => {
				const report = await kv.get(key.name, 'json');
				if (report && typeof report === 'object') {
					reports.push(normalizePendingReport(report));
				}
			}),
		);
		cursor = page.list_complete ? undefined : page.cursor;
	} while (cursor);
	return reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function putAcceptedReport(env, report) {
	await requireKv(env).put(acceptedReportKey(report.playerId), JSON.stringify(report));
}

async function listAcceptedReports(env) {
	const kv = requireKv(env);
	const reports = [];
	let cursor;
	do {
		const page = await kv.list({ prefix: 'report:accepted:', cursor });
		await Promise.all(
			page.keys.map(async (key) => {
				const report = await kv.get(key.name, 'json');
				if (report && typeof report === 'object') {
					reports.push(report);
				}
			}),
		);
		cursor = page.list_complete ? undefined : page.cursor;
	} while (cursor);
	return reports;
}

async function acceptReport(env, report, reviewerId, publicReason, reviewerNote) {
	const accepted = {
		...report,
		publicReason,
		reviewerNote,
		status: 'accepted',
		reviewedBy: reviewerId,
		reviewedAt: /* @__PURE__ */ new Date().toISOString(),
	};
	if (report.status !== 'accepted' && report.status !== 'ban_confirmed') {
		await recordReportAccepted(env, accepted.reporterId, accepted.reviewedAt);
	}
	await putPendingReport(env, accepted);
	const playerReport = {
		reportId: accepted.id,
		playerId: accepted.targetPlayerId,
		playerName: accepted.targetName,
		reason: publicReason,
		reporterId: accepted.reporterId,
		acceptedBy: reviewerId,
		acceptedAt: accepted.reviewedAt,
		reviewerNote,
	};
	await putAcceptedReport(env, playerReport);
	return accepted;
}

async function rejectReport(env, report, reviewerId, publicReason, reviewerNote) {
	const rejected = {
		...report,
		publicReason,
		reviewerNote,
		status: 'rejected',
		reviewedBy: reviewerId,
		reviewedAt: /* @__PURE__ */ new Date().toISOString(),
	};
	if (report.status !== 'rejected') {
		await recordReportRejected(env, rejected.reporterId, rejected.reviewedAt);
	}
	await putPendingReport(env, rejected);
	return rejected;
}

async function markPendingReportBanConfirmed(env, reportId, confirmedAt) {
	const report = await getPendingReport(env, reportId);
	if (!report) {
		return undefined;
	}
	const alreadyConfirmed = report.status === 'ban_confirmed' || Boolean(report.banConfirmedAt);
	const confirmed = {
		...report,
		status: 'ban_confirmed',
		banConfirmedAt: report.banConfirmedAt || confirmedAt,
	};
	if (!alreadyConfirmed) {
		await recordReportBanConfirmed(env, report.reporterId, confirmedAt);
	}
	await putPendingReport(env, confirmed);
	return confirmed;
}

async function getAcceptedReport(env, targetPlayerId) {
	if (!targetPlayerId || !env.USER_PREFERENCES) {
		return undefined;
	}
	const report = await env.USER_PREFERENCES.get(acceptedReportKey(targetPlayerId), 'json');
	return report && typeof report === 'object' ? report : undefined;
}

async function deleteAcceptedReport(env, targetPlayerId) {
	await requireKv(env).delete(acceptedReportKey(targetPlayerId));
}

async function getPlayerTagRecord(env, targetPlayerId) {
	if (!targetPlayerId || !env.USER_PREFERENCES) {
		return undefined;
	}
	const record = await env.USER_PREFERENCES.get(playerTagsKey(targetPlayerId), 'json');
	if (!record || typeof record !== 'object') {
		return undefined;
	}
	const stored = record;
	return {
		...stored,
		tags: normalizePlayerTagIds(stored.tags),
	};
}

async function getPlayerLookupCount(env, targetPlayerId) {
	if (!targetPlayerId || !env.USER_PREFERENCES) {
		return undefined;
	}
	const record = await env.USER_PREFERENCES.get(playerLookupCountKey(targetPlayerId), 'json');
	if (!record || typeof record !== 'object') {
		return 0;
	}
	const stored = record;
	return typeof stored.count === 'number' && Number.isFinite(stored.count) ? Math.max(0, Math.floor(stored.count)) : 0;
}

async function incrementPlayerLookupCount(env, targetPlayerId, targetName) {
	if (!targetPlayerId || !env.USER_PREFERENCES) {
		return undefined;
	}
	const count = (await getPlayerLookupCount(env, targetPlayerId)) ?? 0;
	const record = {
		playerId: targetPlayerId,
		playerName: targetName,
		count: count + 1,
		updatedAt: /* @__PURE__ */ new Date().toISOString(),
	};
	await env.USER_PREFERENCES.put(playerLookupCountKey(targetPlayerId), JSON.stringify(record));
	return record.count;
}

async function addPlayerTag(env, targetPlayerId, targetName, tag, updatedBy) {
	const existing = await getPlayerTagRecord(env, targetPlayerId);
	const record = {
		playerId: targetPlayerId,
		playerName: targetName,
		tags: normalizePlayerTagIds([...(existing?.tags || []), tag]),
		updatedAt: /* @__PURE__ */ new Date().toISOString(),
		updatedBy,
	};
	await requireKv(env).put(playerTagsKey(targetPlayerId), JSON.stringify(record));
	return record;
}

async function removePlayerTag(env, targetPlayerId, tag, updatedBy) {
	const existing = await getPlayerTagRecord(env, targetPlayerId);
	if (!existing) {
		return undefined;
	}
	const tags = tag ? normalizePlayerTagIds(existing.tags.filter((tagId) => tagId !== tag)) : [];
	if (tags.length === 0) {
		await requireKv(env).delete(playerTagsKey(targetPlayerId));
		return undefined;
	}
	const record = {
		...existing,
		tags,
		updatedAt: /* @__PURE__ */ new Date().toISOString(),
		updatedBy,
	};
	await requireKv(env).put(playerTagsKey(targetPlayerId), JSON.stringify(record));
	return record;
}

async function getReportBlacklistEntry(env, userId) {
	const entry = await requireKv(env).get(reportBlacklistKey(userId), 'json');
	return entry && typeof entry === 'object' ? entry : undefined;
}

async function putReportBlacklistEntry(env, userId, createdBy, reason) {
	const entry = {
		userId,
		createdBy,
		reason,
		createdAt: /* @__PURE__ */ new Date().toISOString(),
	};
	await requireKv(env).put(reportBlacklistKey(userId), JSON.stringify(entry));
	return entry;
}

async function deleteReportBlacklistEntry(env, userId) {
	await requireKv(env).delete(reportBlacklistKey(userId));
}

async function getReportCooldown(env, userId) {
	const cooldown = await requireKv(env).get(reportCooldownKey(userId), 'json');
	if (!cooldown || typeof cooldown !== 'object') {
		return undefined;
	}
	const record = cooldown;
	const retryAt = Date.parse(record.retryAt);
	if (!Number.isFinite(retryAt) || retryAt <= Date.now()) {
		return undefined;
	}
	return record;
}

async function putReportCooldown(env, userId, seconds) {
	const retryAt = new Date(Date.now() + seconds * 1e3).toISOString();
	await requireKv(env).put(reportCooldownKey(userId), JSON.stringify({ retryAt }), { expirationTtl: seconds });
	return { retryAt };
}

async function getReporterReputation(env, userId) {
	if (!env.USER_PREFERENCES) {
		return emptyReporterReputation(userId);
	}
	const record = await env.USER_PREFERENCES.get(reporterReputationKey(userId), 'json');
	if (record && typeof record === 'object') {
		return normalizeReporterReputation(record);
	}
	return reporterReputationFromReports(userId, await listReports(env));
}

async function putReporterReputation(env, record) {
	const normalized = normalizeReporterReputation({
		...record,
		updatedAt: /* @__PURE__ */ new Date().toISOString(),
	});
	await requireKv(env).put(reporterReputationKey(record.userId), JSON.stringify(normalized));
	return normalized;
}

async function updateReporterReputation(env, userId, updates) {
	const existing = await getReporterReputation(env, userId);
	return putReporterReputation(env, {
		...existing,
		...updates,
	});
}

async function recordReportSubmitted(env, userId, submittedAt = /* @__PURE__ */ new Date().toISOString()) {
	const existing = await getReporterReputation(env, userId);
	return updateReporterReputation(env, userId, {
		submittedReports: existing.submittedReports + 1,
		lastReportAt: submittedAt,
	});
}

async function recordReportAccepted(env, userId, acceptedAt = /* @__PURE__ */ new Date().toISOString()) {
	const existing = await getReporterReputation(env, userId);
	return updateReporterReputation(env, userId, {
		acceptedReports: existing.acceptedReports + 1,
		lastAcceptedAt: acceptedAt,
	});
}

async function recordReportRejected(env, userId, rejectedAt = /* @__PURE__ */ new Date().toISOString()) {
	const existing = await getReporterReputation(env, userId);
	return updateReporterReputation(env, userId, {
		rejectedReports: existing.rejectedReports + 1,
		lastRejectedAt: rejectedAt,
	});
}

async function recordReportBanConfirmed(env, userId, confirmedAt = /* @__PURE__ */ new Date().toISOString()) {
	const existing = await getReporterReputation(env, userId);
	return updateReporterReputation(env, userId, {
		banConfirmedReports: existing.banConfirmedReports + 1,
		lastBanConfirmedAt: confirmedAt,
	});
}

async function suspiciousPatternForReport(env, targetPlayerId, reporterId) {
	if (!env.USER_PREFERENCES) {
		return undefined;
	}
	const reports = await listReports(env);
	const reporterIds = Array.from(
		/* @__PURE__ */ new Set([
			reporterId,
			...reports.filter((report) => report.targetPlayerId === targetPlayerId).map((report) => report.reporterId),
		]),
	);
	const reputations = await Promise.all(reporterIds.map((userId) => getReporterReputation(env, userId)));
	const trustedReporterCount = reputations.filter(reporterIsTrustedForSignals).length;
	if (trustedReporterCount < 2) {
		return undefined;
	}
	return {
		kind: 'multiple_independent_reports',
		trustedReporterCount,
		reportCount: reports.filter((report) => report.targetPlayerId === targetPlayerId).length + 1,
		detectedAt: /* @__PURE__ */ new Date().toISOString(),
	};
}

async function getMonthlyCommunityRecap(env, month) {
	if (!env.USER_PREFERENCES) {
		return undefined;
	}
	const record = await env.USER_PREFERENCES.get(monthlyCommunityRecapKey(month), 'json');
	return record && typeof record === 'object' ? record : undefined;
}

async function putMonthlyCommunityRecap(env, record) {
	await requireKv(env).put(monthlyCommunityRecapKey(record.month), JSON.stringify(record));
	return record;
}

export {
	acceptReport,
	addPlayerTag,
	createPendingReport,
	createReportDraft,
	deleteAcceptedReport,
	deleteReportBlacklistEntry,
	deleteReportDraft,
	getAcceptedReport,
	getMonthlyCommunityRecap,
	getOnboardingRecord,
	getPendingReport,
	getPlayerTagRecord,
	getReportBlacklistEntry,
	getReportCooldown,
	getReportDraft,
	getReporterReputation,
	getTracker,
	incrementPlayerLookupCount,
	listAcceptedReports,
	listReports,
	listTrackers,
	markOnboardingStarted,
	markPendingReportBanConfirmed,
	putAcceptedReport,
	putMonthlyCommunityRecap,
	putPendingReport,
	putReportBlacklistEntry,
	putReportCooldown,
	putTracker,
	recordReportAccepted,
	recordReportBanConfirmed,
	recordReportSubmitted,
	rejectReport,
	removePlayerTag,
	reporterTierLabel,
	snapshotDelta,
	snapshotProfile,
	suspiciousPatternForReport,
	trackedPlayerFromProfile,
};
