export type PlayerLevel = {
  level?: number;
  current_xp?: number;
  next_level_xp?: number;
};

export type ModeStats = {
  k?: number;
  d?: number;
  a?: number;
  w?: number;
  l?: number;
};

export type SeasonalStats = {
  season?: number;
  ranked?: ModeStats;
  casual?: ModeStats;
  custom?: ModeStats;
};

export type StatsMode = "ranked" | "casual" | "custom";

export type RankedStats = {
  placement_matches_left?: number;
  wins?: number;
  losses?: number;
  highest_rank?: number;
  mmr?: number;
  global_position?: number;
  rank?: number;
};

export type CriticalOpsProfile = {
  basicInfo?: {
    userID?: number;
    name?: string;
    playerLevel?: PlayerLevel;
    lastSeenTime?: string;
  };
  ban?: unknown;
  stats?: {
    seasonal_stats?: SeasonalStats[];
    ranked?: RankedStats;
    leaderboard_data?: {
      position?: number;
      score?: number;
    };
  };
  clan?: {
    basicInfo?: {
      name?: string;
      tag?: string;
    };
    id?: number;
    memberRank?: number;
  };
};

export type ClanLeaderboardEntry = {
  name?: string;
  tag?: string;
  rating?: number;
  players?: number;
  average_rating?: number;
  kills?: number;
  deaths?: number;
  kdr?: number;
  assists?: number;
  wins?: number;
  losses?: number;
  wlr?: number;
  rank?: number;
};

type ProfileLookup = {
  ign?: string;
  playerId?: string;
};

export type PlayerReport = {
  reportId: string;
  playerId: string;
  playerName: string;
  reason: string;
  reporterId: string;
  acceptedBy?: string;
  acceptedAt?: string;
  reviewerNote?: string;
  banLastCheckedAt?: string;
  banDetectedAt?: string;
  banNotifiedAt?: string;
};

export const COPS_PROFILE_API =
  "https://default.prod.copsapi.criticalforce.fi/api/public/profile";
export const COPS_CLAN_LEADERBOARD_API =
  "https://default.prod.copsapi.criticalforce.fi/api/leaderboard/clan";

export const EMBED_COLOR = 0xff6b21;
const PROFILE_CACHE_TTL_MS = 60 * 1000;
const CLAN_CACHE_TTL_MS = 5 * 60 * 1000;

type TimedCacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const responseCache = new Map<string, TimedCacheEntry<unknown>>();

function cached<T>(key: string): T | undefined {
  const entry = responseCache.get(key);
  if (!entry) {
    return undefined;
  }

  if (entry.expiresAt <= Date.now()) {
    responseCache.delete(key);
    return undefined;
  }

  return entry.value as T;
}

function remember<T>(key: string, value: T, ttlMs: number) {
  responseCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function numberOrZero(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function optionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function formatInteger(value: unknown) {
  return numberOrZero(value).toLocaleString("en-US");
}

export function formatOptionalInteger(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? formatInteger(value)
    : "Unknown";
}

export function formatDecimal(value: number | undefined, digits = 2) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "N/A";
  }

  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatPercentValue(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "N/A";
  }

  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function ratio(numerator: number, denominator: number) {
  if (denominator === 0) {
    return numerator > 0 ? numerator : undefined;
  }

  return numerator / denominator;
}

export function kdValue(stats: ModeStats | undefined) {
  return ratio(numberOrZero(stats?.k), numberOrZero(stats?.d));
}

export function kdaValue(stats: ModeStats | undefined) {
  return ratio(
    numberOrZero(stats?.k) + numberOrZero(stats?.a),
    numberOrZero(stats?.d)
  );
}

export function winRateValue(stats: ModeStats | undefined) {
  const games = matches(stats);
  return games > 0 ? (numberOrZero(stats?.w) / games) * 100 : undefined;
}

export function killsPerMatchValue(stats: ModeStats | undefined) {
  const games = matches(stats);
  return games > 0 ? numberOrZero(stats?.k) / games : undefined;
}

export function kd(stats: ModeStats | undefined) {
  const deaths = numberOrZero(stats?.d);
  const kills = numberOrZero(stats?.k);

  if (deaths === 0) {
    return kills > 0 ? "Perfect" : "0.00";
  }

  return formatDecimal(kills / deaths);
}

export function winRate(stats: ModeStats | undefined) {
  return formatPercentValue(winRateValue(stats));
}

export function matches(stats: ModeStats | undefined) {
  return numberOrZero(stats?.w) + numberOrZero(stats?.l);
}

export function hasStats(stats: ModeStats | undefined) {
  if (!stats) {
    return false;
  }

  return ["k", "d", "a", "w", "l"].some((key) => {
    return numberOrZero(stats[key as keyof ModeStats]) > 0;
  });
}

function addStats(left: ModeStats, right: ModeStats | undefined): ModeStats {
  return {
    k: numberOrZero(left.k) + numberOrZero(right?.k),
    d: numberOrZero(left.d) + numberOrZero(right?.d),
    a: numberOrZero(left.a) + numberOrZero(right?.a),
    w: numberOrZero(left.w) + numberOrZero(right?.w),
    l: numberOrZero(left.l) + numberOrZero(right?.l),
  };
}

export function sumStats(seasons: SeasonalStats[], mode: StatsMode): ModeStats {
  return seasons.reduce<ModeStats>((total, season) => {
    return addStats(total, season[mode]);
  }, {});
}

export function formatStats(stats: ModeStats | undefined) {
  return [
    `K/D/A: ${formatInteger(stats?.k)} / ${formatInteger(
      stats?.d
    )} / ${formatInteger(stats?.a)}`,
    `W-L: ${formatInteger(stats?.w)}-${formatInteger(stats?.l)}`,
    `K/D: ${kd(stats)} | Win rate: ${winRate(stats)}`,
  ].join("\n");
}

export function rankFromMmr(
  mmr: number,
  apiRank: number | undefined,
  globalPosition: number | undefined
) {
  if (apiRank === 9 || (globalPosition && globalPosition > 0 && globalPosition <= 250)) {
    return "Elite Ops";
  }

  if (mmr >= 2000) {
    return "Spec Ops High";
  }

  if (mmr >= 1900) {
    return "Spec Ops Low";
  }

  if (mmr >= 1700) {
    return `Master ${Math.min(4, Math.floor((mmr - 1700) / 50) + 1)}`;
  }

  const tiers = [
    { name: "Iron", start: 0, end: 1199 },
    { name: "Bronze", start: 1200, end: 1299 },
    { name: "Silver", start: 1300, end: 1399 },
    { name: "Gold", start: 1400, end: 1499 },
    { name: "Platinum", start: 1500, end: 1599 },
    { name: "Diamond", start: 1600, end: 1699 },
  ];
  const tier = tiers.find((candidate) => mmr >= candidate.start && mmr <= candidate.end);

  if (!tier) {
    return "Unranked";
  }

  const division = Math.min(4, Math.floor((mmr - tier.start) / 25) + 1);
  return `${tier.name} ${division}`;
}

export function rankName(ranked: RankedStats | undefined) {
  if (!ranked) {
    return "No ranked data";
  }

  const placementsLeft = numberOrZero(ranked.placement_matches_left);
  if (placementsLeft > 0 || ranked.rank === 0) {
    return `Calibrating (${placementsLeft} left)`;
  }

  return rankFromMmr(
    numberOrZero(ranked.mmr),
    ranked.rank,
    ranked.global_position || undefined
  );
}

export function rankProgress(ranked: RankedStats | undefined) {
  if (!ranked) {
    return {
      percent: undefined,
      nextLabel: "No ranked data",
    };
  }

  const placementsLeft = numberOrZero(ranked.placement_matches_left);
  if (placementsLeft > 0 || ranked.rank === 0) {
    return {
      percent: undefined,
      nextLabel: "Finish placements",
    };
  }

  const mmr = numberOrZero(ranked.mmr);
  const milestones = [
    { label: "Bronze", mmr: 1200 },
    { label: "Silver", mmr: 1300 },
    { label: "Gold", mmr: 1400 },
    { label: "Platinum", mmr: 1500 },
    { label: "Diamond", mmr: 1600 },
    { label: "Master", mmr: 1700 },
    { label: "Spec Ops", mmr: 1900 },
    { label: "Elite Ops", mmr: 2100 },
  ];
  const next = milestones.find((milestone) => mmr < milestone.mmr);
  const previous = [...milestones].reverse().find((milestone) => mmr >= milestone.mmr);
  const start = previous?.mmr ?? 0;
  const end = next?.mmr ?? Math.max(2200, mmr);
  const percent = end > start ? Math.min(100, Math.max(0, ((mmr - start) / (end - start)) * 100)) : 100;

  return {
    percent,
    nextLabel: next ? next.label : "Top ladder",
  };
}

export function formatRank(ranked: RankedStats | undefined) {
  if (!ranked) {
    return "No ranked data";
  }

  const placementsLeft = numberOrZero(ranked.placement_matches_left);
  const mmr = numberOrZero(ranked.mmr);
  const globalPosition = ranked.global_position || undefined;

  if (placementsLeft > 0 || ranked.rank === 0) {
    return [
      `Rank: Calibrating (${placementsLeft} placement${
        placementsLeft === 1 ? "" : "s"
      } left)`,
      `MMR: ${formatInteger(mmr)}`,
    ].join("\n");
  }

  const leaderboard =
    globalPosition && globalPosition > 0
      ? `\nLeaderboard: #${formatInteger(globalPosition)}`
      : "";

  return [
    `Rank: ${rankName(ranked)}`,
    `MMR: ${formatInteger(mmr)}${leaderboard}`,
    `Season W-L: ${formatInteger(ranked.wins)}-${formatInteger(ranked.losses)}`,
  ].join("\n");
}

export function displayName(profile: CriticalOpsProfile) {
  return profile.basicInfo?.name || "Unknown player";
}

export function playerId(profile: CriticalOpsProfile) {
  return profile.basicInfo?.userID ? String(profile.basicInfo.userID) : undefined;
}

export function formatClanMembership(profile: CriticalOpsProfile) {
  if (!profile.clan) {
    return "Not in a clan";
  }

  const name = profile.clan.basicInfo?.name || "Unknown clan";
  const tag = profile.clan.basicInfo?.tag ? `[${profile.clan.basicInfo.tag}] ` : "";
  const role = numberOrZero(profile.clan.memberRank) >= 40 ? "Owner" : "Member";

  return `${tag}${name}\nRole: ${role}`;
}

export function clanLine(profile: CriticalOpsProfile) {
  if (!profile.clan) {
    return "No clan";
  }

  const tag = profile.clan.basicInfo?.tag ? `[${profile.clan.basicInfo.tag}] ` : "";
  return `${tag}${profile.clan.basicInfo?.name || "Unknown clan"}`;
}

function firstString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function firstBoolean(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "boolean") {
      return value;
    }
  }

  return undefined;
}

function parseTimestampSeconds(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 10_000_000_000 ? Math.floor(value / 1000) : Math.floor(value);
  }

  if (typeof value === "string" && value.trim()) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return parseTimestampSeconds(numeric);
    }

    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) {
      return Math.floor(parsed / 1000);
    }
  }

  return undefined;
}

function firstTimestampSeconds(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const parsed = parseTimestampSeconds(source[key]);
    if (parsed) {
      return parsed;
    }
  }

  return undefined;
}

export function formatBan(ban: unknown) {
  if (!ban) {
    return "No active ban";
  }

  if (typeof ban === "string") {
    return ban;
  }

  if (typeof ban !== "object") {
    return "Active ban";
  }

  const data = ban as Record<string, unknown>;
  const reason =
    firstString(data, ["reason", "banReason", "message", "description", "type"]) ||
    "No reason provided";
  const permanent = firstBoolean(data, ["permanent", "isPermanent", "is_permanent"]);
  const endsAt = firstTimestampSeconds(data, [
    "expiresAt",
    "expires_at",
    "endTime",
    "end_time",
    "until",
    "banEndsAt",
    "ban_ends_at",
    "unbanTime",
    "expires",
  ]);
  
  if (endsAt && endsAt > Math.floor(Date.now() / 1000)) {
    return `Banned: ${reason}\nEnds: <t:${endsAt}:R> (<t:${endsAt}:f>)`;
  }

  if (permanent || !endsAt) {
    return `Banned: ${reason}\nDuration: Permanent or undisclosed`;
  }

  return `Banned: ${reason}\nEnd time: <t:${endsAt}:f>`;
}

export function hasActiveBan(ban: unknown) {
  if (!ban) {
    return false;
  }

  if (typeof ban === "string") {
    const normalized = ban.trim().toLowerCase();
    return Boolean(normalized) && !/^no\s+(active\s+)?ban/.test(normalized);
  }

  if (typeof ban !== "object") {
    return true;
  }

  const data = ban as Record<string, unknown>;
  const active = firstBoolean(data, [
    "active",
    "isActive",
    "is_active",
    "banned",
    "isBanned",
    "is_banned",
  ]);
  if (active === false) {
    return false;
  }

  const permanent = firstBoolean(data, ["permanent", "isPermanent", "is_permanent"]);
  if (permanent) {
    return true;
  }

  const endsAt = firstTimestampSeconds(data, [
    "expiresAt",
    "expires_at",
    "endTime",
    "end_time",
    "until",
    "banEndsAt",
    "ban_ends_at",
    "unbanTime",
    "expires",
  ]);

  return endsAt ? endsAt > Math.floor(Date.now() / 1000) : true;
}

export function accountCreatedEstimate(seasons: SeasonalStats[]) {
  const firstSeason = seasons.reduce<number | undefined>((earliest, season) => {
    if (
      typeof season.season !== "number" ||
      (!hasStats(season.ranked) && !hasStats(season.casual) && !hasStats(season.custom))
    ) {
      return earliest;
    }

    return earliest === undefined ? season.season : Math.min(earliest, season.season);
  }, undefined);

  if (typeof firstSeason !== "number") {
    return "No public stat history";
  }

  return `Account appears to have been created around Season ${firstSeason}`;
}

export function currentSeason(seasons: SeasonalStats[]) {
  return seasons.reduce<number | undefined>((latest, season) => {
    if (typeof season.season !== "number") {
      return latest;
    }

    return latest === undefined ? season.season : Math.max(latest, season.season);
  }, undefined);
}

export function seasonByNumber(seasons: SeasonalStats[], seasonNumber: number | undefined) {
  return seasons.find((season) => season.season === seasonNumber);
}

export function latestSeason(profile: CriticalOpsProfile) {
  const seasons = profile.stats?.seasonal_stats ?? [];
  return seasonByNumber(seasons, currentSeason(seasons));
}

export function fieldValue(value: string) {
  return value.length > 1024 ? `${value.slice(0, 1021)}...` : value;
}

export function playerLookupFromValue(value: string): ProfileLookup {
  return /^\d+$/.test(value) ? { playerId: value } : { ign: value };
}

export function statField(name: string, stats: ModeStats | undefined, inline = true) {
  return {
    name,
    value: fieldValue(
      formatStats(stats)
        .split("\n")
        .map((line) => `> - ${line}`)
        .join("\n")
    ),
    inline,
  };
}

export function embedFooter(page: number, pages: number, note?: string) {
  const prefix = `Page ${page}/${pages}`;
  return {
    text: note ? `${prefix} - ${note}` : prefix,
  };
}

export async function fetchJson<T>(url: string, ttlMs = 0) {
  const cacheKey = `json:${url}`;
  const cachedValue = ttlMs > 0 ? cached<T>(cacheKey) : undefined;
  if (cachedValue) {
    return cachedValue;
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  const data = (await response.json()) as T;
  if (ttlMs > 0) {
    remember(cacheKey, data, ttlMs);
  }
  return data;
}

export async function fetchCriticalOpsProfile(lookup: ProfileLookup) {
  const params = lookup.playerId
    ? `ids=${encodeURIComponent(lookup.playerId)}`
    : `usernames=${encodeURIComponent(lookup.ign || "")}`;
  const url = `${COPS_PROFILE_API}?${params}`;
  const cacheKey = `profile:${url}`;
  const cachedProfile = cached<CriticalOpsProfile | undefined>(cacheKey);
  if (cachedProfile) {
    return cachedProfile;
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 500 || response.status === 404) {
      return undefined;
    }

    throw new Error(`Critical Ops API returned ${response.status}`);
  }

  const profiles = (await response.json()) as CriticalOpsProfile[];
  const profile = profiles[0];
  if (profile) {
    remember(cacheKey, profile, PROFILE_CACHE_TTL_MS);
  }
  return profile;
}

export async function fetchProfileByPlayerOption(player: string) {
  return fetchCriticalOpsProfile(playerLookupFromValue(player));
}

export async function fetchClanLeaderboard() {
  return fetchJson<ClanLeaderboardEntry[]>(COPS_CLAN_LEADERBOARD_API, CLAN_CACHE_TTL_MS);
}

function normalizeSearch(value: string | undefined) {
  return (value || "").trim().toLowerCase();
}

export function findClan(
  clans: ClanLeaderboardEntry[],
  search: string
): ClanLeaderboardEntry | undefined {
  const normalized = normalizeSearch(search);
  return (
    clans.find((clan) => normalizeSearch(clan.name) === normalized) ||
    clans.find((clan) => normalizeSearch(clan.tag) === normalized) ||
    clans.find((clan) => normalizeSearch(clan.name).includes(normalized)) ||
    clans.find((clan) => normalizeSearch(clan.tag).includes(normalized))
  );
}
