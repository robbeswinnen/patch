// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.
import { supportServerUrl } from './brand';
import { bulletList, container, textDisplay, v2Message } from './components-v2';
import { discordBotToken, interactionUserId, runInBackground, sendDiscordDm } from './discord';
import { getOnboardingRecord, markOnboardingStarted } from './storage';

const ONBOARDING_COMMANDS = /* @__PURE__ */ new Set(['help', 'stats', 'profile', 'compare', 'track', 'report']);
function buildOnboardingMessage(env) {
	return v2Message([
		container([
			textDisplay(
				[
					'## Welcome to Patch',
					'You just used Patch for the first time, so here is the quick map.',
					bulletList([
						'`/profile` opens the player hub.',
						'`/track` shows changes when you ask for them.',
						'`/report` is there when you have image or video proof staff should review.',
					]),
					`Ideas, questions, and updates live in Patch Labs: ${supportServerUrl(env)}`,
					'That is the whole starter kit. I will keep the inbox quiet from here.',
				].join('\n\n'),
			),
		]),
	]);
}

async function startOnboarding(interaction, env, commandName) {
	const userId = interactionUserId(interaction);
	if (!userId || !env.USER_PREFERENCES || !discordBotToken(env)) {
		return;
	}
	if (await getOnboardingRecord(env, userId)) {
		return;
	}
	await markOnboardingStarted(env, userId, commandName);
	try {
		await sendDiscordDm(env, userId, buildOnboardingMessage(env));
	} catch (error) {
		console.error('Failed to send onboarding DM', {
			userId,
			commandName,
			error,
		});
	}
}

function startOnboardingSoon(interaction, env, commandName, runtime) {
	if (!ONBOARDING_COMMANDS.has(commandName) || !runtime?.waitUntil) {
		return;
	}
	runInBackground(runtime, () => startOnboarding(interaction, env, commandName));
}

export { startOnboardingSoon };
