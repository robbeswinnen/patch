// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.
import { displayName, fetchProfileByPlayerOption, formatInteger, formatLastOnlineValue, formatOptionalInteger, playerId } from './cops';
import { getTracker, listTrackers, putTracker, snapshotDelta, snapshotProfile, trackedPlayerFromProfile } from './storage';

const TRACKER_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1e3;
const MAX_TRACKERS_PER_CRON = 20;
function signed(value) {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		return 'N/A';
	}
	if (value > 0) {
		return `+${formatInteger(value)}`;
	}
	return formatInteger(value);
}

function movementScore(delta) {
	return (
		Math.abs(delta.mmr || 0) * 5 +
		Math.abs(delta.kills || 0) +
		Math.abs(delta.deaths || 0) +
		Math.abs(delta.level || 0) * 10 +
		(delta.rankChanged ? 100 : 0)
	);
}

function isFresh(isoDate, now) {
	if (!isoDate) {
		return false;
	}
	const parsedTimestamp = Date.parse(isoDate);
	return Number.isFinite(parsedTimestamp) && now.getTime() - parsedTimestamp < TRACKER_REFRESH_INTERVAL_MS;
}

function trackingChanges(record) {
	return record.players.map((player) => {
		const latest = player.latestSnapshot || player.lastSnapshot;
		const baseline = player.baselineSnapshot || player.lastSnapshot;
		const delta = latest
			? snapshotDelta(baseline, latest)
			: {
					kills: undefined,
					deaths: undefined,
					mmr: undefined,
					level: undefined,
					rankChanged: false,
				};
		const score = movementScore(delta);
		return {
			player,
			baseline,
			latest,
			delta,
			changed: score > 0,
			movementScore: score,
		};
	});
}

function trackingChangeLines(change) {
	const latest = change.latest;
	if (!latest) {
		return ['No snapshot has been captured for this player yet.'];
	}
	return [
		`Rank: **${latest.rank}**${change.delta.rankChanged && change.baseline?.rank ? ` from ${change.baseline.rank}` : ''}`,
		latest.peakRank ? `Peak: **${latest.peakRank}**` : undefined,
		latest.lastOnlineAt ? `Last online: **${formatLastOnlineValue(latest.lastOnlineAt)}**` : undefined,
		`MMR: **${formatOptionalInteger(latest.mmr)}** (${signed(change.delta.mmr)})`,
		`Kills: **${formatInteger(latest.kills)}** (${signed(change.delta.kills)})`,
		`Deaths: **${formatInteger(latest.deaths)}** (${signed(change.delta.deaths)})`,
		`Level: **${formatOptionalInteger(latest.level)}** (${signed(change.delta.level)})`,
	].filter((line) => Boolean(line));
}

function acceptTrackerBaselines(record, now = /* @__PURE__ */ new Date()) {
	const viewedAt = now.toISOString();
	for (const player of record.players) {
		const latest = player.latestSnapshot || player.lastSnapshot;
		if (!latest) {
			continue;
		}
		player.baselineSnapshot = latest;
		player.lastViewedAt = viewedAt;
	}
	record.lastViewedAt = viewedAt;
	return record;
}

async function refreshTrackerRecord(env, record, options = {}) {
	const now = options.now || /* @__PURE__ */ new Date();
	let refreshed = 0;
	for (const player of record.players) {
		if (!options.force && isFresh(player.lastRefreshedAt || player.latestSnapshot?.capturedAt, now)) {
			continue;
		}
		if (typeof options.maxPlayers === 'number' && refreshed >= options.maxPlayers) {
			break;
		}
		try {
			const profile = await fetchProfileByPlayerOption(player.lookup);
			if (!profile) {
				continue;
			}
			const next = snapshotProfile(profile);
			player.latestSnapshot = next;
			player.lastSnapshot = next;
			player.lastRefreshedAt = next.capturedAt;
			player.label = displayName(profile);
			player.playerId = playerId(profile) || player.playerId;
			player.lookup = player.playerId || player.lookup;
			refreshed += 1;
		} catch (error) {
			console.error('Failed to refresh tracked player', {
				userId: record.userId,
				player: player.lookup,
				error,
			});
		}
	}
	if (refreshed > 0) {
		record.lastRefreshedAt = now.toISOString();
	}
	return {
		record,
		refreshed,
	};
}

async function toggleTrackedProfile(env, userId, lookup) {
	const profile = await fetchProfileByPlayerOption(lookup);
	if (!profile) {
		return {
			ok: false,
			reason: 'not_found',
		};
	}
	const record = await getTracker(env, userId);
	const tracked = trackedPlayerFromProfile(lookup, profile);
	const existing = record.players.findIndex((player) => player.key === tracked.key);
	const removed = existing >= 0;
	if (removed) {
		record.players.splice(existing, 1);
	} else {
		if (record.players.length >= 25) {
			return {
				ok: false,
				reason: 'full',
			};
		}
		record.players.push(tracked);
	}
	await putTracker(env, record);
	return {
		ok: true,
		removed,
		profile,
		record,
	};
}

async function addTrackedProfile(env, userId, lookup) {
	const profile = await fetchProfileByPlayerOption(lookup);
	if (!profile) {
		return {
			ok: false,
			reason: 'not_found',
		};
	}
	const record = await getTracker(env, userId);
	const tracked = trackedPlayerFromProfile(lookup, profile);
	const existing = record.players.findIndex((player) => player.key === tracked.key);
	if (existing >= 0) {
		record.players[existing] = {
			...record.players[existing],
			label: tracked.label,
			lookup: tracked.lookup,
			playerId: tracked.playerId,
			latestSnapshot: tracked.latestSnapshot,
			lastSnapshot: tracked.lastSnapshot,
			lastRefreshedAt: tracked.lastRefreshedAt,
		};
		await putTracker(env, record);
		return {
			ok: true,
			alreadyTracked: true,
			profile,
			record,
		};
	}
	if (record.players.length >= 25) {
		return {
			ok: false,
			reason: 'full',
		};
	}
	record.players.push(tracked);
	await putTracker(env, record);
	return {
		ok: true,
		alreadyTracked: false,
		profile,
		record,
	};
}

async function runScheduledRankedUpdates(env, now = /* @__PURE__ */ new Date()) {
	if (!env.USER_PREFERENCES) {
		return;
	}
	const trackers = await listTrackers(env);
	let checked = 0;
	for (const record of trackers) {
		if (checked >= MAX_TRACKERS_PER_CRON) {
			break;
		}
		if (record.players.length === 0 || isFresh(record.lastRefreshedAt, now)) {
			continue;
		}
		checked += 1;
		const refreshed = await refreshTrackerRecord(env, record, {
			now,
			maxPlayers: 10,
		});
		if (refreshed.refreshed > 0) {
			await putTracker(env, refreshed.record);
		}
	}
}

export {
	acceptTrackerBaselines,
	addTrackedProfile,
	refreshTrackerRecord,
	runScheduledRankedUpdates,
	toggleTrackedProfile,
	trackingChangeLines,
	trackingChanges,
};
