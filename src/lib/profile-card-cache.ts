// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.
import { renderPlayerCardPng } from './card-image';
import { supportServerLabel } from './brand';
import { displayName, latestSeason, playerId } from './cops';
import { getAcceptedReport, getPlayerTagRecord } from './storage';

const CARD_CACHE_VERSION = 'v13';
const LOOKUP_TTL_SECONDS = 30 * 60;
const CONTENT_TTL_SECONDS = 60 * 60;
const MEMORY_MAX_ENTRIES = 32;
const memoryCache = /* @__PURE__ */ new Map();
const textEncoder = new TextEncoder();
const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
function isPng(body) {
	return PNG_SIGNATURE.every((byte, index) => body[index] === byte);
}

function attachmentName(name) {
	return `${
		name
			.toLowerCase()
			.replace(/[^a-z0-9_-]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 48) || 'player'
	}-card.png`;
}

function normalizedLookup(value) {
	return value.trim().toLowerCase();
}

function rememberCard(key, card, ttlSeconds) {
	memoryCache.delete(key);
	memoryCache.set(key, {
		...card,
		expiresAt: Date.now() + ttlSeconds * 1e3,
	});
	while (memoryCache.size > MEMORY_MAX_ENTRIES) {
		const oldest = memoryCache.keys().next().value;
		if (!oldest) {
			break;
		}
		memoryCache.delete(oldest);
	}
}

function recall(key) {
	const entry = memoryCache.get(key);
	if (!entry) {
		return undefined;
	}
	if (entry.expiresAt <= Date.now()) {
		memoryCache.delete(key);
		return undefined;
	}
	memoryCache.delete(key);
	memoryCache.set(key, entry);
	return entry;
}

async function sha256(value) {
	const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(value));
	return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function cacheRequest(key) {
	return new Request(`https://patch.local/profile-card-cache/${key}`);
}

async function readEdgeCache(key, fallbackName) {
	const response = await caches.default.match(cacheRequest(key));
	if (!response) {
		return undefined;
	}
	const body = new Uint8Array(await response.arrayBuffer());
	if (!isPng(body)) {
		await caches.default.delete(cacheRequest(key));
		return undefined;
	}
	return {
		body,
		filename: attachmentName(fallbackName),
		description: `Patch profile card for ${fallbackName}`,
	};
}

async function writeEdgeCache(key, card, ttlSeconds) {
	await caches.default.put(
		cacheRequest(key),
		new Response(card.body, {
			headers: {
				'Cache-Control': `public, max-age=${ttlSeconds}`,
				'Content-Type': 'image/png',
			},
		}),
	);
}

async function readKvCache(env, key, fallbackName) {
	const body = await env.USER_PREFERENCES?.get(`card-cache:${key}`, 'arrayBuffer');
	if (!body) {
		return undefined;
	}
	const bytes = new Uint8Array(body);
	if (!isPng(bytes)) {
		await env.USER_PREFERENCES?.delete(`card-cache:${key}`);
		return undefined;
	}
	return {
		body: bytes,
		filename: attachmentName(fallbackName),
		description: `Patch profile card for ${fallbackName}`,
	};
}

async function writeKvCache(env, key, card, ttlSeconds) {
	await env.USER_PREFERENCES?.put(`card-cache:${key}`, card.body.slice().buffer, {
		expirationTtl: ttlSeconds,
	});
}

function profileCardFingerprint(profile, report, tags = [], supportLabel) {
	const season = latestSeason(profile);
	return JSON.stringify({
		version: CARD_CACHE_VERSION,
		supportLabel,
		name: displayName(profile),
		playerId: playerId(profile),
		level: profile.basicInfo?.playerLevel?.level,
		// Lookup counts change on every command; avoid busting the expensive PNG cache for that alone.
		ban: profile.ban,
		clan: profile.clan,
		ranked: profile.stats?.ranked,
		season: season?.season,
		seasonRanked: season?.ranked,
		report: report
			? {
					reason: report.reason,
					acceptedAt: report.acceptedAt,
				}
			: undefined,
		tags,
	});
}

async function cacheKeysForLookup(player) {
	const lookup = normalizedLookup(player);
	return {
		memory: `lookup:${lookup}`,
		durable: `lookup:${await sha256(`${CARD_CACHE_VERSION}:${lookup}`)}`,
	};
}

async function cacheKeysForProfile(profile, report, tags = [], supportLabel) {
	const fingerprint = profileCardFingerprint(profile, report, tags, supportLabel);
	return {
		memory: `content:${fingerprint}`,
		durable: `content:${await sha256(fingerprint)}`,
	};
}

function schedule(promise, waitUntil) {
	const logged = promise.catch((error) => {
		console.error('Failed to update profile card cache.', error);
	});
	if (waitUntil) {
		waitUntil(logged);
	}
}

async function readDurableCache(key, fallbackName, env) {
	try {
		const edgeHit = await readEdgeCache(key, fallbackName);
		if (edgeHit) {
			return edgeHit;
		}
	} catch (error) {
		console.error('Failed to read profile card edge cache.', error);
	}
	try {
		return await readKvCache(env, key, fallbackName);
	} catch (error) {
		console.error('Failed to read profile card KV cache.', error);
		return undefined;
	}
}

function writeDurableCache(key, card, ttlSeconds, env, waitUntil) {
	schedule(writeEdgeCache(key, card, ttlSeconds), waitUntil);
	if (env.USER_PREFERENCES) {
		schedule(writeKvCache(env, key, card, ttlSeconds), waitUntil);
	}
}

async function clearPlayerCardLookupCaches(env, lookups) {
	const uniqueLookups = Array.from(new Set(lookups.map((lookup) => lookup.trim()).filter(Boolean)));
	await Promise.all(
		uniqueLookups.map(async (lookup) => {
			const keys = await cacheKeysForLookup(lookup);
			memoryCache.delete(keys.memory);
			await Promise.allSettled([
				caches.default.delete(cacheRequest(keys.durable)),
				env.USER_PREFERENCES?.delete(`card-cache:${keys.durable}`),
			]);
		}),
	);
}

async function getOrRenderPlayerCardFromProfile(env, player, profile, waitUntil, context = {}) {
	const targetPlayerId = playerId(profile);
	const hasReport = Object.prototype.hasOwnProperty.call(context, 'report');
	const hasTags = Object.prototype.hasOwnProperty.call(context, 'tags');
	const [loadedReport, tagRecord] = await Promise.all([
		hasReport ? Promise.resolve(context.report) : getAcceptedReport(env, targetPlayerId),
		hasTags ? Promise.resolve(undefined) : getPlayerTagRecord(env, targetPlayerId),
	]);
	const report = hasReport ? context.report : loadedReport;
	const tags = context.tags || tagRecord?.tags || [];
	const lookupCount = context.lookupCount;
	const display = displayName(profile);
	const lookupKeys = await cacheKeysForLookup(player);
	const contentKeys = await cacheKeysForProfile(profile, report, tags, supportServerLabel(env));
	const contentMemoryHit = recall(contentKeys.memory);
	if (contentMemoryHit) {
		if (!isPng(contentMemoryHit.body)) {
			memoryCache.delete(contentKeys.memory);
			memoryCache.delete(lookupKeys.memory);
		} else {
			rememberCard(lookupKeys.memory, contentMemoryHit, LOOKUP_TTL_SECONDS);
			return contentMemoryHit;
		}
	}
	const contentDurableHit = await readDurableCache(contentKeys.durable, display, env);
	if (contentDurableHit) {
		rememberCard(contentKeys.memory, contentDurableHit, CONTENT_TTL_SECONDS);
		rememberCard(lookupKeys.memory, contentDurableHit, LOOKUP_TTL_SECONDS);
		writeDurableCache(lookupKeys.durable, contentDurableHit, LOOKUP_TTL_SECONDS, env, waitUntil);
		return contentDurableHit;
	}
	const rendered = {
		body: await renderPlayerCardPng(profile, 'Patch', report, tags, lookupCount, env),
		filename: attachmentName(display),
		description: `Patch profile card for ${display}`,
	};
	rememberCard(contentKeys.memory, rendered, CONTENT_TTL_SECONDS);
	rememberCard(lookupKeys.memory, rendered, LOOKUP_TTL_SECONDS);
	writeDurableCache(contentKeys.durable, rendered, CONTENT_TTL_SECONDS, env, waitUntil);
	writeDurableCache(lookupKeys.durable, rendered, LOOKUP_TTL_SECONDS, env, waitUntil);
	return rendered;
}

export { clearPlayerCardLookupCaches, getOrRenderPlayerCardFromProfile };
