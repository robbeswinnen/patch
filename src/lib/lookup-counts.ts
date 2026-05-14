import type { Env } from "../types";
import type { CriticalOpsProfile } from "./cops";
import { displayName, playerId } from "./cops";
import { incrementPlayerLookupCount } from "./storage";

type WaitUntil = (promise: Promise<unknown>) => void;

export async function recordProfileLookup(
  env: Env,
  profile: CriticalOpsProfile
) {
  try {
    return await incrementPlayerLookupCount(env, playerId(profile), displayName(profile));
  } catch (error) {
    console.error("Failed to update player lookup count.", error);
    return undefined;
  }
}

export function recordProfileLookupSoon(
  env: Env,
  profile: CriticalOpsProfile,
  waitUntil?: WaitUntil
) {
  const job = recordProfileLookup(env, profile);
  if (waitUntil) {
    waitUntil(job);
  }
  return job;
}
