import type { Env } from "../types";
import type { CriticalOpsProfile, PlayerReport } from "./cops";
import { displayName, latestSeason, playerId, rankName } from "./cops";
import type { PlayerTagId } from "./player-tags";
import { normalizePlayerTagIds } from "./player-tags";

export type RankedSnapshot = {
  capturedAt: string;
  season?: number;
  kills: number;
  deaths: number;
  mmr?: number;
  rank: string;
  level?: number;
};

export type TrackedPlayer = {
  key: string;
  lookup: string;
  label: string;
  playerId?: string;
  lastSnapshot?: RankedSnapshot;
  addedAt: string;
};

export type TrackerRecord = {
  userId: string;
  players: TrackedPlayer[];
  updatedAt: string;
};

export type PendingReport = {
  id: string;
  status: "pending" | "accepted" | "rejected";
  reporterId: string;
  targetPlayerId: string;
  targetName: string;
  reason: string;
  details?: string;
  proof?: ReportProof;
  reviewerNote?: string;
  publicReason?: string;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
};

export type ReportProof = {
  url: string;
  filename?: string;
  contentType?: string;
  size?: number;
};

export type ReportDraft = {
  id: string;
  reporterId: string;
  player: string;
  proof: ReportProof;
  createdAt: string;
};

export type ReportBlacklistEntry = {
  userId: string;
  reason?: string;
  createdAt: string;
  createdBy: string;
};

export type ReportCooldown = {
  retryAt: string;
};

export type PlayerTagRecord = {
  playerId: string;
  playerName: string;
  tags: PlayerTagId[];
  updatedAt: string;
  updatedBy: string;
};

export type PlayerLookupCountRecord = {
  playerId: string;
  playerName: string;
  count: number;
  updatedAt: string;
};

function requireKv(env: Env) {
  if (!env.USER_PREFERENCES) {
    throw new Error("Missing USER_PREFERENCES KV binding");
  }

  return env.USER_PREFERENCES;
}

function trackerKey(userId: string) {
  return `track:${userId}`;
}

function acceptedReportKey(targetPlayerId: string) {
  return `report:accepted:${targetPlayerId}`;
}

function playerTagsKey(targetPlayerId: string) {
  return `player:tags:${targetPlayerId}`;
}

function playerLookupCountKey(targetPlayerId: string) {
  return `player:lookup-count:${targetPlayerId}`;
}

function pendingReportKey(reportId: string) {
  return `report:pending:${reportId}`;
}

function reportDraftKey(reportId: string) {
  return `report:draft:${reportId}`;
}

function reportBlacklistKey(userId: string) {
  return `report:blacklist:${userId}`;
}

function reportCooldownKey(userId: string) {
  return `report:cooldown:${userId}`;
}

export async function getTracker(env: Env, userId: string): Promise<TrackerRecord> {
  const stored = await requireKv(env).get(trackerKey(userId), "json");
  if (stored && typeof stored === "object") {
    return stored as TrackerRecord;
  }

  return {
    userId,
    players: [],
    updatedAt: new Date().toISOString(),
  };
}

export async function putTracker(env: Env, record: TrackerRecord) {
  await requireKv(env).put(
    trackerKey(record.userId),
    JSON.stringify({
      ...record,
      updatedAt: new Date().toISOString(),
    })
  );
}

export async function listTrackers(env: Env) {
  const kv = requireKv(env);
  const records: TrackerRecord[] = [];
  let cursor: string | undefined;

  do {
    const page = await kv.list({ prefix: "track:", cursor });
    await Promise.all(
      page.keys.map(async (key) => {
        const record = await kv.get(key.name, "json");
        if (record && typeof record === "object") {
          records.push(record as TrackerRecord);
        }
      })
    );
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  return records;
}

export function snapshotProfile(profile: CriticalOpsProfile): RankedSnapshot {
  const season = latestSeason(profile);
  return {
    capturedAt: new Date().toISOString(),
    season: season?.season,
    kills: Number(season?.ranked?.k || 0),
    deaths: Number(season?.ranked?.d || 0),
    mmr: profile.stats?.ranked?.mmr,
    rank: rankName(profile.stats?.ranked),
    level: profile.basicInfo?.playerLevel?.level,
  };
}

export function trackedPlayerFromProfile(
  lookup: string,
  profile: CriticalOpsProfile
): TrackedPlayer {
  const id = playerId(profile);
  return {
    key: id || lookup.toLowerCase(),
    lookup: id || lookup,
    label: displayName(profile),
    playerId: id,
    lastSnapshot: snapshotProfile(profile),
    addedAt: new Date().toISOString(),
  };
}

export function snapshotDelta(previous: RankedSnapshot | undefined, next: RankedSnapshot) {
  const diff = (a: number | undefined, b: number | undefined) =>
    typeof a === "number" && typeof b === "number" ? b - a : undefined;

  return {
    kills: diff(previous?.kills, next.kills),
    deaths: diff(previous?.deaths, next.deaths),
    mmr: diff(previous?.mmr, next.mmr),
    level: diff(previous?.level, next.level),
    rankChanged: previous?.rank && previous.rank !== next.rank,
  };
}

export async function createPendingReport(
  env: Env,
  report: Omit<PendingReport, "status" | "createdAt">
) {
  const pending: PendingReport = {
    ...report,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  await requireKv(env).put(pendingReportKey(report.id), JSON.stringify(pending));
  return pending;
}

export async function createReportDraft(
  env: Env,
  draft: Omit<ReportDraft, "createdAt">
) {
  const stored: ReportDraft = {
    ...draft,
    createdAt: new Date().toISOString(),
  };
  await requireKv(env).put(reportDraftKey(stored.id), JSON.stringify(stored), {
    expirationTtl: 15 * 60,
  });
  return stored;
}

export async function getReportDraft(env: Env, draftId: string) {
  const draft = await requireKv(env).get(reportDraftKey(draftId), "json");
  return draft && typeof draft === "object" ? (draft as ReportDraft) : undefined;
}

export async function deleteReportDraft(env: Env, draftId: string) {
  await requireKv(env).delete(reportDraftKey(draftId));
}

export async function getPendingReport(env: Env, reportId: string) {
  const report = await requireKv(env).get(pendingReportKey(reportId), "json");
  return report && typeof report === "object" ? (report as PendingReport) : undefined;
}

export async function putPendingReport(env: Env, report: PendingReport) {
  await requireKv(env).put(pendingReportKey(report.id), JSON.stringify(report));
}

export async function putAcceptedReport(env: Env, report: PlayerReport) {
  await requireKv(env).put(
    acceptedReportKey(report.playerId),
    JSON.stringify(report)
  );
}

export async function listAcceptedReports(env: Env) {
  const kv = requireKv(env);
  const reports: PlayerReport[] = [];
  let cursor: string | undefined;

  do {
    const page = await kv.list({ prefix: "report:accepted:", cursor });
    await Promise.all(
      page.keys.map(async (key) => {
        const report = await kv.get(key.name, "json");
        if (report && typeof report === "object") {
          reports.push(report as PlayerReport);
        }
      })
    );
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  return reports;
}

export async function acceptReport(
  env: Env,
  report: PendingReport,
  reviewerId: string,
  publicReason: string,
  reviewerNote: string
) {
  const accepted: PendingReport = {
    ...report,
    publicReason,
    reviewerNote,
    status: "accepted",
    reviewedBy: reviewerId,
    reviewedAt: new Date().toISOString(),
  };
  await putPendingReport(env, accepted);
  const playerReport: PlayerReport = {
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

export async function rejectReport(
  env: Env,
  report: PendingReport,
  reviewerId: string,
  publicReason: string,
  reviewerNote: string
) {
  const rejected: PendingReport = {
    ...report,
    publicReason,
    reviewerNote,
    status: "rejected",
    reviewedBy: reviewerId,
    reviewedAt: new Date().toISOString(),
  };
  await putPendingReport(env, rejected);
  return rejected;
}

export async function getAcceptedReport(env: Env, targetPlayerId: string | undefined) {
  if (!targetPlayerId || !env.USER_PREFERENCES) {
    return undefined;
  }

  const report = await env.USER_PREFERENCES.get(
    acceptedReportKey(targetPlayerId),
    "json"
  );
  return report && typeof report === "object" ? (report as PlayerReport) : undefined;
}

export async function deleteAcceptedReport(env: Env, targetPlayerId: string) {
  await requireKv(env).delete(acceptedReportKey(targetPlayerId));
}

export async function getPlayerTagRecord(
  env: Env,
  targetPlayerId: string | undefined
) {
  if (!targetPlayerId || !env.USER_PREFERENCES) {
    return undefined;
  }

  const record = await env.USER_PREFERENCES.get(
    playerTagsKey(targetPlayerId),
    "json"
  );
  if (!record || typeof record !== "object") {
    return undefined;
  }

  const stored = record as PlayerTagRecord;
  return {
    ...stored,
    tags: normalizePlayerTagIds(stored.tags),
  };
}

export async function getPlayerLookupCount(
  env: Env,
  targetPlayerId: string | undefined
) {
  if (!targetPlayerId || !env.USER_PREFERENCES) {
    return undefined;
  }

  const record = await env.USER_PREFERENCES.get(
    playerLookupCountKey(targetPlayerId),
    "json"
  );

  if (!record || typeof record !== "object") {
    return 0;
  }

  const stored = record as Partial<PlayerLookupCountRecord>;
  return typeof stored.count === "number" && Number.isFinite(stored.count)
    ? Math.max(0, Math.floor(stored.count))
    : 0;
}

export async function incrementPlayerLookupCount(
  env: Env,
  targetPlayerId: string | undefined,
  targetName: string
) {
  if (!targetPlayerId || !env.USER_PREFERENCES) {
    return undefined;
  }

  const count = (await getPlayerLookupCount(env, targetPlayerId)) ?? 0;
  const record: PlayerLookupCountRecord = {
    playerId: targetPlayerId,
    playerName: targetName,
    count: count + 1,
    updatedAt: new Date().toISOString(),
  };

  await env.USER_PREFERENCES.put(
    playerLookupCountKey(targetPlayerId),
    JSON.stringify(record)
  );

  return record.count;
}

export async function addPlayerTag(
  env: Env,
  targetPlayerId: string,
  targetName: string,
  tag: PlayerTagId,
  updatedBy: string
) {
  const existing = await getPlayerTagRecord(env, targetPlayerId);
  const record: PlayerTagRecord = {
    playerId: targetPlayerId,
    playerName: targetName,
    tags: normalizePlayerTagIds([...(existing?.tags || []), tag]),
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  await requireKv(env).put(playerTagsKey(targetPlayerId), JSON.stringify(record));
  return record;
}

export async function removePlayerTag(
  env: Env,
  targetPlayerId: string,
  tag: PlayerTagId | undefined,
  updatedBy: string
) {
  const existing = await getPlayerTagRecord(env, targetPlayerId);
  if (!existing) {
    return undefined;
  }

  const tags = tag
    ? normalizePlayerTagIds(existing.tags.filter((tagId) => tagId !== tag))
    : [];

  if (tags.length === 0) {
    await requireKv(env).delete(playerTagsKey(targetPlayerId));
    return undefined;
  }

  const record: PlayerTagRecord = {
    ...existing,
    tags,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
  await requireKv(env).put(playerTagsKey(targetPlayerId), JSON.stringify(record));
  return record;
}

export async function getReportBlacklistEntry(env: Env, userId: string) {
  const entry = await requireKv(env).get(reportBlacklistKey(userId), "json");
  return entry && typeof entry === "object" ? (entry as ReportBlacklistEntry) : undefined;
}

export async function putReportBlacklistEntry(
  env: Env,
  userId: string,
  createdBy: string,
  reason?: string
) {
  const entry: ReportBlacklistEntry = {
    userId,
    createdBy,
    reason,
    createdAt: new Date().toISOString(),
  };
  await requireKv(env).put(reportBlacklistKey(userId), JSON.stringify(entry));
  return entry;
}

export async function deleteReportBlacklistEntry(env: Env, userId: string) {
  await requireKv(env).delete(reportBlacklistKey(userId));
}

export async function getReportCooldown(env: Env, userId: string) {
  const cooldown = await requireKv(env).get(reportCooldownKey(userId), "json");
  if (!cooldown || typeof cooldown !== "object") {
    return undefined;
  }

  const record = cooldown as ReportCooldown;
  const retryAt = Date.parse(record.retryAt);
  if (!Number.isFinite(retryAt) || retryAt <= Date.now()) {
    return undefined;
  }

  return record;
}

export async function putReportCooldown(
  env: Env,
  userId: string,
  seconds: number
) {
  const retryAt = new Date(Date.now() + seconds * 1000).toISOString();
  await requireKv(env).put(
    reportCooldownKey(userId),
    JSON.stringify({ retryAt }),
    { expirationTtl: seconds }
  );
  return { retryAt };
}
