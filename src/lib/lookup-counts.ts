// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.
import { displayName, playerId } from './cops';
import { incrementPlayerLookupCount } from './storage';

async function recordProfileLookup(env, profile, _userId, _lookup) {
	try {
		return await incrementPlayerLookupCount(env, playerId(profile), displayName(profile));
	} catch (error) {
		console.error('Failed to update player lookup count.', error);
		return undefined;
	}
}

function recordProfileLookupSoon(env, profile, waitUntil, userId, lookup) {
	const job = recordProfileLookup(env, profile, userId, lookup);
	if (waitUntil) {
		waitUntil(job);
	}
	return job;
}

export { recordProfileLookup, recordProfileLookupSoon };
