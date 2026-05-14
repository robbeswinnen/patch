import type { Env } from "../types";
import type { CriticalOpsProfile, PlayerReport } from "./cops";
import type { PlayerTagId } from "./player-tags";
import {
  displayName,
  latestSeason,
  playerId,
} from "./cops";
import { formatLookupCountLabel, renderPlayerCardPng } from "./card-image";
import { getAcceptedReport, getPlayerTagRecord } from "./storage";

const CARD_CACHE_VERSION = "v10";
const LOOKUP_TTL_SECONDS = 5 * 60;
const CONTENT_TTL_SECONDS = 60 * 60;
const MEMORY_MAX_ENTRIES = 32;

type CachedPlayerCard = {
  body: Uint8Array;
  filename: string;
  description: string;
};

type MemoryEntry = CachedPlayerCard & {
  expiresAt: number;
};

type PlayerCardRenderContext = {
  report?: PlayerReport;
  tags?: readonly PlayerTagId[];
  lookupCount?: number;
};

const memoryCache = new Map<string, MemoryEntry>();
const textEncoder = new TextEncoder();

function attachmentName(name: string) {
  return `${name
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "player"}-card.png`;
}

function normalizedLookup(value: string) {
  return value.trim().toLowerCase();
}

function remember(key: string, card: CachedPlayerCard, ttlSeconds: number) {
  memoryCache.delete(key);
  memoryCache.set(key, {
    ...card,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });

  while (memoryCache.size > MEMORY_MAX_ENTRIES) {
    const oldest = memoryCache.keys().next().value;
    if (!oldest) {
      break;
    }
    memoryCache.delete(oldest);
  }
}

function recall(key: string): CachedPlayerCard | undefined {
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

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(value));
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function cacheRequest(key: string) {
  return new Request(`https://patch.local/profile-card-cache/${key}`);
}

async function readEdgeCache(key: string, fallbackName: string) {
  const response = await caches.default.match(cacheRequest(key));
  if (!response) {
    return undefined;
  }

  const body = new Uint8Array(await response.arrayBuffer());
  return {
    body,
    filename: attachmentName(fallbackName),
    description: `Patch profile card for ${fallbackName}`,
  };
}

async function writeEdgeCache(key: string, card: CachedPlayerCard, ttlSeconds: number) {
  await caches.default.put(
    cacheRequest(key),
    new Response(card.body, {
      headers: {
        "Cache-Control": `public, max-age=${ttlSeconds}`,
        "Content-Type": "image/png",
      },
    })
  );
}

async function readKvCache(env: Env, key: string, fallbackName: string) {
  const body = await env.USER_PREFERENCES?.get(`card-cache:${key}`, "arrayBuffer");
  if (!body) {
    return undefined;
  }

  return {
    body: new Uint8Array(body),
    filename: attachmentName(fallbackName),
    description: `Patch profile card for ${fallbackName}`,
  };
}

async function writeKvCache(env: Env, key: string, card: CachedPlayerCard, ttlSeconds: number) {
  await env.USER_PREFERENCES?.put(`card-cache:${key}`, card.body.slice().buffer, {
    expirationTtl: ttlSeconds,
  });
}

function profileCardFingerprint(
  profile: CriticalOpsProfile,
  report?: PlayerReport,
  tags: readonly PlayerTagId[] = [],
  lookupCount?: number
) {
  const season = latestSeason(profile);

  return JSON.stringify({
    version: CARD_CACHE_VERSION,
    name: displayName(profile),
    playerId: playerId(profile),
    level: profile.basicInfo?.playerLevel?.level,
    lookupCountLabel: formatLookupCountLabel(lookupCount),
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

async function cacheKeysForLookup(player: string) {
  const lookup = normalizedLookup(player);
  return {
    memory: `lookup:${lookup}`,
    durable: `lookup:${await sha256(`${CARD_CACHE_VERSION}:${lookup}`)}`,
  };
}

async function cacheKeysForProfile(
  profile: CriticalOpsProfile,
  report?: PlayerReport,
  tags: readonly PlayerTagId[] = [],
  lookupCount?: number
) {
  const fingerprint = profileCardFingerprint(profile, report, tags, lookupCount);
  return {
    memory: `content:${fingerprint}`,
    durable: `content:${await sha256(fingerprint)}`,
  };
}

function schedule(promise: Promise<unknown>, waitUntil?: (promise: Promise<unknown>) => void) {
  const logged = promise.catch((error) => {
    console.error("Failed to update profile card cache.", error);
  });

  if (waitUntil) {
    waitUntil(logged);
  }
}

async function readDurableCache(key: string, fallbackName: string, env: Env) {
  try {
    const edgeHit = await readEdgeCache(key, fallbackName);
    if (edgeHit) {
      return edgeHit;
    }
  } catch (error) {
    console.error("Failed to read profile card edge cache.", error);
  }

  try {
    return await readKvCache(env, key, fallbackName);
  } catch (error) {
    console.error("Failed to read profile card KV cache.", error);
    return undefined;
  }
}

function writeDurableCache(
  key: string,
  card: CachedPlayerCard,
  ttlSeconds: number,
  env: Env,
  waitUntil?: (promise: Promise<unknown>) => void
) {
  schedule(writeEdgeCache(key, card, ttlSeconds), waitUntil);
  if (env.USER_PREFERENCES) {
    schedule(writeKvCache(env, key, card, ttlSeconds), waitUntil);
  }
}

export async function clearPlayerCardLookupCaches(env: Env, lookups: string[]) {
  const uniqueLookups = Array.from(
    new Set(lookups.map((lookup) => lookup.trim()).filter(Boolean))
  );

  await Promise.all(
    uniqueLookups.map(async (lookup) => {
      const keys = await cacheKeysForLookup(lookup);
      memoryCache.delete(keys.memory);
      await Promise.allSettled([
        caches.default.delete(cacheRequest(keys.durable)),
        env.USER_PREFERENCES?.delete(`card-cache:${keys.durable}`),
      ]);
    })
  );
}

export async function getOrRenderPlayerCard(
  env: Env,
  player: string,
  waitUntil?: (promise: Promise<unknown>) => void
): Promise<CachedPlayerCard | undefined> {
  const lookupKeys = await cacheKeysForLookup(player);
  const lookupName = player.trim() || "player";
  const lookupMemoryHit = recall(lookupKeys.memory);
  if (lookupMemoryHit) {
    return lookupMemoryHit;
  }

  const lookupDurableHit = await readDurableCache(
    lookupKeys.durable,
    lookupName,
    env
  );
  if (lookupDurableHit) {
    remember(lookupKeys.memory, lookupDurableHit, LOOKUP_TTL_SECONDS);
    return lookupDurableHit;
  }

  return undefined;
}

export async function getOrRenderPlayerCardFromProfile(
  env: Env,
  player: string,
  profile: CriticalOpsProfile,
  waitUntil?: (promise: Promise<unknown>) => void,
  context: PlayerCardRenderContext = {}
): Promise<CachedPlayerCard> {
  const targetPlayerId = playerId(profile);
  const hasReport = Object.prototype.hasOwnProperty.call(context, "report");
  const hasTags = Object.prototype.hasOwnProperty.call(context, "tags");
  const [loadedReport, tagRecord] = await Promise.all([
    hasReport ? Promise.resolve(context.report) : getAcceptedReport(env, targetPlayerId),
    hasTags ? Promise.resolve(undefined) : getPlayerTagRecord(env, targetPlayerId),
  ]);
  const report = hasReport ? context.report : loadedReport;
  const tags = context.tags || tagRecord?.tags || [];
  const lookupCount = context.lookupCount;
  const display = displayName(profile);
  const lookupKeys = await cacheKeysForLookup(player);
  const contentKeys = await cacheKeysForProfile(profile, report, tags, lookupCount);
  const contentMemoryHit = recall(contentKeys.memory);
  if (contentMemoryHit) {
    remember(lookupKeys.memory, contentMemoryHit, LOOKUP_TTL_SECONDS);
    return contentMemoryHit;
  }

  const contentDurableHit = await readDurableCache(contentKeys.durable, display, env);
  if (contentDurableHit) {
    remember(contentKeys.memory, contentDurableHit, CONTENT_TTL_SECONDS);
    remember(lookupKeys.memory, contentDurableHit, LOOKUP_TTL_SECONDS);
    writeDurableCache(lookupKeys.durable, contentDurableHit, LOOKUP_TTL_SECONDS, env, waitUntil);
    return contentDurableHit;
  }

  const rendered = {
    body: await renderPlayerCardPng(profile, "Patch", report, tags, lookupCount),
    filename: attachmentName(display),
    description: `Patch profile card for ${display}`,
  };

  remember(contentKeys.memory, rendered, CONTENT_TTL_SECONDS);
  remember(lookupKeys.memory, rendered, LOOKUP_TTL_SECONDS);
  writeDurableCache(contentKeys.durable, rendered, CONTENT_TTL_SECONDS, env, waitUntil);
  writeDurableCache(lookupKeys.durable, rendered, LOOKUP_TTL_SECONDS, env, waitUntil);

  return rendered;
}
