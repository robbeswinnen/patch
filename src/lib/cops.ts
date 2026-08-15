// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.

const COPS_PROFILE_API = 'https://default.prod.copsapi.criticalforce.fi/api/public/profile';
const EMBED_COLOR = 16739105;
const PROFILE_CACHE_TTL_MS = 60 * 1e3;
const COPS_FETCH_TIMEOUT_MS = 6500;
const CLAN_CACHE_TTL_MS = 5 * 60 * 1e3;
const responseCache = /* @__PURE__ */ new Map();
function cached(key) {
	const entry = responseCache.get(key);
	if (!entry) {
		return undefined;
	}
	if (entry.expiresAt <= Date.now()) {
		responseCache.delete(key);
		return undefined;
	}
	return entry.value;
}

function remember(key, value, ttlMs) {
	responseCache.set(key, {
		value,
		expiresAt: Date.now() + ttlMs,
	});
}

function timeoutSignal(ms) {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), ms);
	return {
		signal: controller.signal,
		clear: () => clearTimeout(timeoutId),
	};
}

function numberOrZero(value) {
	return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function formatInteger(value) {
	return numberOrZero(value).toLocaleString('en-US');
}

function formatOptionalInteger(value) {
	return typeof value === 'number' && Number.isFinite(value) ? formatInteger(value) : 'Unknown';
}

function formatDecimal(value, digits = 2) {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		return 'N/A';
	}
	return value.toLocaleString('en-US', {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits,
	});
}

function formatPercentValue(value) {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		return 'N/A';
	}
	return `${value.toLocaleString('en-US', {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1,
	})}%`;
}

function ratio(numerator, denominator) {
	if (denominator === 0) {
		return numerator > 0 ? numerator : undefined;
	}
	return numerator / denominator;
}

function kdValue(stats) {
	return ratio(numberOrZero(stats?.k), numberOrZero(stats?.d));
}

function kdaValue(stats) {
	return ratio(numberOrZero(stats?.k) + numberOrZero(stats?.a), numberOrZero(stats?.d));
}

function winRateValue(stats) {
	const games = matches(stats);
	return games > 0 ? (numberOrZero(stats?.w) / games) * 100 : undefined;
}

function killsPerMatchValue(stats) {
	const games = matches(stats);
	return games > 0 ? numberOrZero(stats?.k) / games : undefined;
}

function kd(stats) {
	const deaths = numberOrZero(stats?.d);
	const kills = numberOrZero(stats?.k);
	if (deaths === 0) {
		return kills > 0 ? 'Perfect' : '0.00';
	}
	return formatDecimal(kills / deaths);
}

function winRate(stats) {
	return formatPercentValue(winRateValue(stats));
}

function matches(stats) {
	return numberOrZero(stats?.w) + numberOrZero(stats?.l);
}

function hasStats(stats) {
	if (!stats) {
		return false;
	}
	return ['k', 'd', 'a', 'w', 'l'].some((key) => {
		return numberOrZero(stats[key]) > 0;
	});
}

function addStats(left, right) {
	return {
		k: numberOrZero(left.k) + numberOrZero(right?.k),
		d: numberOrZero(left.d) + numberOrZero(right?.d),
		a: numberOrZero(left.a) + numberOrZero(right?.a),
		w: numberOrZero(left.w) + numberOrZero(right?.w),
		l: numberOrZero(left.l) + numberOrZero(right?.l),
	};
}

function sumStats(seasons, mode) {
	return seasons.reduce((total, season) => {
		return addStats(total, season[mode]);
	}, {});
}

function formatStats(stats) {
	return [
		`K/D/A: ${formatInteger(stats?.k)} / ${formatInteger(stats?.d)} / ${formatInteger(stats?.a)}`,
		`W-L: ${formatInteger(stats?.w)}-${formatInteger(stats?.l)}`,
		`K/D: ${kd(stats)} | Win rate: ${winRate(stats)}`,
	].join('\n');
}

function rankFromMmr(mmr, apiRank, globalPosition) {
	if (apiRank === 9 || (globalPosition && globalPosition > 0 && globalPosition <= 250)) {
		return 'Elite Ops';
	}
	if (mmr >= 2e3) {
		return 'Spec Ops High';
	}
	if (mmr >= 1900) {
		return 'Spec Ops Low';
	}
	if (mmr >= 1700) {
		return `Master ${Math.min(4, Math.floor((mmr - 1700) / 50) + 1)}`;
	}
	const tiers = [
		{ name: 'Iron', start: 0, end: 1199 },
		{ name: 'Bronze', start: 1200, end: 1299 },
		{ name: 'Silver', start: 1300, end: 1399 },
		{ name: 'Gold', start: 1400, end: 1499 },
		{ name: 'Platinum', start: 1500, end: 1599 },
		{ name: 'Diamond', start: 1600, end: 1699 },
	];
	const tier = tiers.find((candidate) => mmr >= candidate.start && mmr <= candidate.end);
	if (!tier) {
		return 'Unranked';
	}
	const division = Math.min(4, Math.floor((mmr - tier.start) / 25) + 1);
	return `${tier.name} ${division}`;
}

function rankName(ranked) {
	if (!ranked) {
		return 'No ranked data';
	}
	const placementsLeft = numberOrZero(ranked.placement_matches_left);
	if (placementsLeft > 0 || ranked.rank === 0) {
		return `Calibrating`;
	}
	return rankFromMmr(numberOrZero(ranked.mmr), ranked.rank, ranked.global_position || undefined);
}

const PEAK_RANK_LABELS = ['Unranked', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Spec Ops', 'Elite Ops'];
function peakRankName(ranked) {
	const raw = ranked?.highest_rank;
	if (typeof raw !== 'number' || !Number.isFinite(raw)) {
		return undefined;
	}
	const index = raw === 9 ? PEAK_RANK_LABELS.length - 1 : Math.max(0, Math.min(PEAK_RANK_LABELS.length - 1, Math.trunc(raw)));
	return index > 0 ? PEAK_RANK_LABELS[index] : undefined;
}

function peakRankLine(ranked) {
	const peak = peakRankName(ranked);
	return peak ? `Peak: ${peak}` : undefined;
}

function rankProgress(ranked) {
	if (!ranked) {
		return {
			percent: undefined,
			nextLabel: 'No ranked data',
		};
	}
	const placementsLeft = numberOrZero(ranked.placement_matches_left);
	if (placementsLeft > 0 || ranked.rank === 0) {
		return {
			percent: undefined,
			nextLabel: 'Finish placements',
		};
	}
	const mmr = numberOrZero(ranked.mmr);
	const milestones = [
		{ label: 'Bronze', mmr: 1200 },
		{ label: 'Silver', mmr: 1300 },
		{ label: 'Gold', mmr: 1400 },
		{ label: 'Platinum', mmr: 1500 },
		{ label: 'Diamond', mmr: 1600 },
		{ label: 'Master', mmr: 1700 },
		{ label: 'Spec Ops', mmr: 1900 },
		{ label: 'Elite Ops', mmr: 2100 },
	];
	const next = milestones.find((milestone) => mmr < milestone.mmr);
	const previous = [...milestones].reverse().find((milestone) => mmr >= milestone.mmr);
	const start = previous?.mmr ?? 0;
	const end = next?.mmr ?? Math.max(2200, mmr);
	const percent = end > start ? Math.min(100, Math.max(0, ((mmr - start) / (end - start)) * 100)) : 100;
	return {
		percent,
		nextLabel: next ? next.label : 'Top ladder',
	};
}

function formatRank(ranked) {
	if (!ranked) {
		return 'No ranked data';
	}
	const placementsLeft = numberOrZero(ranked.placement_matches_left);
	const mmr = numberOrZero(ranked.mmr);
	const globalPosition = ranked.global_position || undefined;
	if (placementsLeft > 0 || ranked.rank === 0) {
		return [`Rank: Calibrating (${placementsLeft} placement${placementsLeft === 1 ? '' : 's'} left)`, `MMR: ${formatInteger(mmr)}`].join(
			'\n',
		);
	}
	const leaderboard =
		globalPosition && globalPosition > 0
			? `
Leaderboard: #${formatInteger(globalPosition)}`
			: '';
	return [
		`Rank: ${rankName(ranked)}`,
		peakRankLine(ranked),
		`MMR: ${formatInteger(mmr)}${leaderboard}`,
		`Season W-L: ${formatInteger(ranked.wins)}-${formatInteger(ranked.losses)}`,
	]
		.filter(Boolean)
		.join('\n');
}

function displayName(profile) {
	return profile.basicInfo?.name || 'Unknown player';
}

function playerId(profile) {
	return profile.basicInfo?.userID ? String(profile.basicInfo.userID) : undefined;
}

function formatClanMembership(profile) {
	if (!profile.clan) {
		return 'Not in a clan';
	}
	const name = profile.clan.basicInfo?.name || 'Unknown clan';
	const tag = profile.clan.basicInfo?.tag ? `[${profile.clan.basicInfo.tag}] ` : '';
	const role = numberOrZero(profile.clan.memberRank) >= 40 ? 'Owner' : 'Member';
	return `${tag}${name}
Role: ${role}`;
}

function clanLine(profile) {
	if (!profile.clan) {
		return 'No clan';
	}
	const tag = profile.clan.basicInfo?.tag ? `[${profile.clan.basicInfo.tag}] ` : '';
	return `${tag}${profile.clan.basicInfo?.name || 'Unknown clan'}`;
}

function firstBoolean(source, keys) {
	for (const key of keys) {
		const value = source[key];
		if (typeof value === 'boolean') {
			return value;
		}
		if (typeof value === 'string' && value.trim()) {
			const normalized = value.trim().toLowerCase();
			if (['true', 'yes', '1'].includes(normalized)) {
				return true;
			}
			if (['false', 'no', '0'].includes(normalized)) {
				return false;
			}
		}
	}
	return undefined;
}

function firstString(source, keys) {
	for (const key of keys) {
		const value = source[key];
		if (typeof value === 'string' && value.trim()) {
			return value.trim();
		}
	}
	return undefined;
}

function firstNumber(source, keys) {
	for (const key of keys) {
		const value = source[key];
		if (typeof value === 'number' && Number.isFinite(value)) {
			return value;
		}
		if (typeof value === 'string' && value.trim()) {
			const parsed = Number(value);
			if (Number.isFinite(parsed)) {
				return parsed;
			}
		}
	}
	return undefined;
}

function parseTimestampSeconds(value) {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value > 1e10 ? Math.floor(value / 1e3) : Math.floor(value);
	}
	if (typeof value === 'string' && value.trim()) {
		const numeric = Number(value);
		if (Number.isFinite(numeric)) {
			return parseTimestampSeconds(numeric);
		}
		const parsed = Date.parse(value);
		if (Number.isFinite(parsed)) {
			return Math.floor(parsed / 1e3);
		}
	}
	return undefined;
}

const LAST_ONLINE_TIMESTAMP_KEYS = [
	'lastSeenTime',
	'last_seen_time',
	'lastSeenAt',
	'last_seen_at',
	'lastOnline',
	'last_online',
	'lastOnlineAt',
	'last_online_at',
	'LastSeenTime',
	'LastOnline',
];
const DISCORD_TIMESTAMP_STYLES = /* @__PURE__ */ new Set(['t', 'T', 'd', 'D', 'f', 'F', 'R']);
function firstTimestampSeconds(source, keys) {
	for (const key of keys) {
		const parsed = parseTimestampSeconds(source[key]);
		if (parsed) {
			return parsed;
		}
	}
	return undefined;
}

function profileLastOnlineSeconds(profile) {
	const basicInfo = profile.basicInfo;
	if (!basicInfo) {
		return undefined;
	}
	const seconds = firstTimestampSeconds(basicInfo, LAST_ONLINE_TIMESTAMP_KEYS);
	if (!seconds || seconds <= 0) {
		return undefined;
	}
	const now = Math.floor(Date.now() / 1e3);
	return seconds <= now + 5 * 60 ? seconds : undefined;
}

function discordTimestamp(seconds, style = 'R') {
	const normalizedStyle = DISCORD_TIMESTAMP_STYLES.has(style) ? style : 'R';
	return `<t:${Math.floor(seconds)}:${normalizedStyle}>`;
}

function formatLastOnline(profile, fallback, style = 'R') {
	const seconds = profileLastOnlineSeconds(profile);
	return seconds ? discordTimestamp(seconds, style) : fallback;
}

function formatLastOnlineValue(value, fallback, style = 'R') {
	const seconds = parseTimestampSeconds(value);
	return seconds && seconds > 0 ? discordTimestamp(seconds, style) : fallback;
}

function profileLastOnlineIso(profile) {
	const seconds = profileLastOnlineSeconds(profile);
	return seconds ? new Date(seconds * 1e3).toISOString() : undefined;
}

const BAN_END_TIMESTAMP_KEYS = [
	'ExpiresAt',
	'expiresAt',
	'expires_at',
	'ExpirationTime',
	'expirationTime',
	'expiration_time',
	'EndTime',
	'endTime',
	'end_time',
	'Until',
	'until',
	'BanEndsAt',
	'banEndsAt',
	'ban_ends_at',
	'UnbanTime',
	'unbanTime',
	'unban_time',
	'Expires',
	'expires',
];
const BAN_SECONDS_LEFT_KEYS = [
	'SecondsLeft',
	'secondsLeft',
	'seconds_left',
	'TimeLeft',
	'timeLeft',
	'time_left',
	'RemainingSeconds',
	'remainingSeconds',
	'remaining_seconds',
];
const BAN_TYPE_KEYS = ['Type', 'type', 'BanType', 'banType', 'ban_type'];
const BAN_REASON_KEYS = ['Reason', 'reason', 'BanReason', 'banReason', 'ban_reason'];
const BAN_PERMANENT_TEXT_KEYS = [
	'Duration',
	'duration',
	'BanDuration',
	'banDuration',
	'ban_duration',
	'Type',
	'type',
	'BanType',
	'banType',
	'ban_type',
];
function compactDuration(totalSeconds) {
	const seconds = Math.max(0, Math.floor(totalSeconds));
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.max(1, Math.floor((seconds % 3600) / 60));
	if (days > 0) {
		return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
	}
	if (hours > 0) {
		return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
	}
	return `${minutes}m`;
}

function banSecondsLeft(ban) {
	if (!ban || typeof ban !== 'object') {
		return undefined;
	}
	const seconds = firstNumber(ban, BAN_SECONDS_LEFT_KEYS);
	return typeof seconds === 'number' ? Math.max(0, Math.floor(seconds)) : undefined;
}

function activeBanFlag(data) {
	return firstBoolean(data, ['active', 'isActive', 'is_active', 'banned', 'isBanned', 'is_banned']);
}

function banType(data) {
	return firstNumber(data, BAN_TYPE_KEYS);
}

function banReasonSignal(data) {
	const numericReason = firstNumber(data, BAN_REASON_KEYS);
	if (typeof numericReason === 'number') {
		return numericReason > 0;
	}
	const textReason = firstString(data, BAN_REASON_KEYS);
	return Boolean(textReason && !/^(none|no(ne)?|0)$/i.test(textReason));
}

function hasBanStatusSignal(data) {
	const active = activeBanFlag(data);
	if (active === true) {
		return true;
	}
	const type = banType(data);
	return (typeof type === 'number' && type > 0) || banReasonSignal(data);
}

function activeBanEndsAtSeconds(ban, now = Date.now()) {
	if (!ban || typeof ban !== 'object') {
		return undefined;
	}
	const data = ban;
	const banExpiry = firstTimestampSeconds(data, BAN_END_TIMESTAMP_KEYS);
	if (banExpiry) {
		return banExpiry;
	}
	const secondsLeft = banSecondsLeft(data);
	return secondsLeft !== undefined && secondsLeft > 0 ? Math.floor(now / 1e3) + secondsLeft : undefined;
}

function formatBanDurationLeft(ban, now = Date.now()) {
	const secondsLeft = banSecondsLeft(ban);
	if (secondsLeft !== undefined) {
		return secondsLeft > 0 ? compactDuration(secondsLeft) : undefined;
	}
	const endsAt = activeBanEndsAtSeconds(ban, now);
	const nowSeconds = Math.floor(now / 1e3);
	if (!endsAt || endsAt <= nowSeconds) {
		return undefined;
	}
	return compactDuration(endsAt - nowSeconds);
}

function isPermanentBan(ban) {
	if (!ban || typeof ban !== 'object') {
		return false;
	}
	const data = ban;
	if (activeBanFlag(data) === false) {
		return false;
	}
	if (firstBoolean(data, ['permanent', 'isPermanent', 'is_permanent']) === true) {
		return true;
	}
	const durationText = firstString(data, BAN_PERMANENT_TEXT_KEYS);
	if (durationText && /permanent|perm/i.test(durationText)) {
		return true;
	}
	const secondsLeft = banSecondsLeft(data);
	const hasEndTimestamp = firstTimestampSeconds(data, BAN_END_TIMESTAMP_KEYS) !== undefined;
	return secondsLeft !== undefined && secondsLeft <= 0 && !hasEndTimestamp && hasBanStatusSignal(data);
}

function formatBan(ban) {
	if (!ban) {
		return 'No active ban';
	}
	if (typeof ban === 'string') {
		return ban;
	}
	if (typeof ban !== 'object') {
		return 'Active ban';
	}
	const data = ban;
	if (activeBanFlag(data) === false) {
		return 'No active ban';
	}
	const secondsLeft = banSecondsLeft(data);
	const permanent = isPermanentBan(data);
	if (secondsLeft !== undefined && secondsLeft <= 0 && !permanent && !hasBanStatusSignal(data)) {
		return 'No active ban';
	}
	const endsAt = activeBanEndsAtSeconds(data);
	if (endsAt && endsAt > Math.floor(Date.now() / 1e3)) {
		const timeLeft = formatBanDurationLeft(data);
		return `Banned
Time left: ${timeLeft || 'less than 1m'}
Ends: <t:${endsAt}:R> (<t:${endsAt}:f>)`;
	}
	if (permanent || !endsAt) {
		return `Banned
Duration: ${permanent ? 'Permanent' : 'Active'}`;
	}
	return `Banned
End time: <t:${endsAt}:f>`;
}

function hasActiveBan(ban) {
	if (!ban) {
		return false;
	}
	if (typeof ban === 'string') {
		const normalized = ban.trim().toLowerCase();
		return Boolean(normalized) && !/^no\s+(active\s+)?ban/.test(normalized);
	}
	if (typeof ban !== 'object') {
		return true;
	}
	const data = ban;
	const active = activeBanFlag(data);
	if (active === false) {
		return false;
	}
	if (isPermanentBan(data)) {
		return true;
	}
	const secondsLeft = banSecondsLeft(data);
	if (secondsLeft !== undefined) {
		return secondsLeft > 0 || hasBanStatusSignal(data);
	}
	const endsAt = activeBanEndsAtSeconds(data);
	return endsAt ? endsAt > Math.floor(Date.now() / 1e3) : true;
}

function accountCreatedEstimate(seasons) {
	const firstSeason = seasons.reduce((earliest, season) => {
		if (typeof season.season !== 'number' || (!hasStats(season.ranked) && !hasStats(season.casual) && !hasStats(season.custom))) {
			return earliest;
		}
		return earliest === undefined ? season.season : Math.min(earliest, season.season);
	}, undefined);
	if (typeof firstSeason !== 'number') {
		return 'No public stat history';
	}
	return `Account appears to have been created around Season ${firstSeason}`;
}

function currentSeason(seasons) {
	return seasons.reduce((latest, season) => {
		if (typeof season.season !== 'number') {
			return latest;
		}
		return latest === undefined ? season.season : Math.max(latest, season.season);
	}, undefined);
}

function seasonByNumber(seasons, seasonNumber) {
	return seasons.find((season) => season.season === seasonNumber);
}

function latestSeason(profile) {
	const seasons = profile.stats?.seasonal_stats ?? [];
	return seasonByNumber(seasons, currentSeason(seasons));
}

function fieldValue(value) {
	return value.length > 1024 ? `${value.slice(0, 1021)}...` : value;
}

function playerLookupFromValue(value) {
	return /^\d+$/.test(value) ? { playerId: value } : { ign: value };
}

function statField(name, stats, inline = true) {
	return {
		name,
		value: fieldValue(
			formatStats(stats)
				.split('\n')
				.map((line) => `> - ${line}`)
				.join('\n'),
		),
		inline,
	};
}

async function fetchCriticalOpsProfile(lookup) {
	const params = lookup.playerId ? `ids=${encodeURIComponent(lookup.playerId)}` : `usernames=${encodeURIComponent(lookup.ign || '')}`;
	const url = `${COPS_PROFILE_API}?${params}`;
	const cacheKey = `profile:${url}`;
	const cachedProfile = cached(cacheKey);
	if (cachedProfile) {
		return cachedProfile;
	}
	const timeout = timeoutSignal(COPS_FETCH_TIMEOUT_MS);
	let response;
	try {
		response = await fetch(url, {
			headers: {
				Accept: 'application/json',
			},
			signal: timeout.signal,
		});
	} finally {
		timeout.clear();
	}
	if (!response.ok) {
		if (response.status === 500 || response.status === 404) {
			return undefined;
		}
		throw new Error(`Critical Ops API returned ${response.status}`);
	}
	const profiles = await response.json();
	const profile = profiles[0];
	if (profile) {
		remember(cacheKey, profile, PROFILE_CACHE_TTL_MS);
	}
	return profile;
}

async function fetchProfileByPlayerOption(player) {
	return fetchCriticalOpsProfile(playerLookupFromValue(player));
}

export {
	EMBED_COLOR,
	accountCreatedEstimate,
	clanLine,
	currentSeason,
	displayName,
	fetchProfileByPlayerOption,
	fieldValue,
	formatBan,
	formatClanMembership,
	formatDecimal,
	formatInteger,
	formatLastOnline,
	formatLastOnlineValue,
	formatOptionalInteger,
	formatPercentValue,
	formatRank,
	formatStats,
	hasActiveBan,
	kd,
	kdValue,
	kdaValue,
	killsPerMatchValue,
	latestSeason,
	numberOrZero,
	peakRankName,
	playerId,
	profileLastOnlineIso,
	rankName,
	rankProgress,
	seasonByNumber,
	statField,
	sumStats,
	winRate,
	winRateValue,
};
