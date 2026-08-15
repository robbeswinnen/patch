const fs = require('node:fs');
const path = require('node:path');

function loadDotEnv(filename = '.env') {
	const filePath = path.join(__dirname, filename);
	if (!fs.existsSync(filePath)) {
		return;
	}

	for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) {
			continue;
		}

		const separator = trimmed.indexOf('=');
		if (separator < 1) {
			continue;
		}

		const key = trimmed.slice(0, separator).trim();
		const rawValue = trimmed.slice(separator + 1).trim();
		const value = rawValue.replace(/^(['"])(.*)\1$/, '$2');
		process.env[key] ||= value;
	}
}

loadDotEnv();

const APPLICATION_COMMAND = 1;
const STRING_OPTION = 3;
const ATTACHMENT_OPTION = 11;

const USER_INSTALLABLE_CONTEXTS = {
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};

const PLAYER_OPTION = {
	description: 'Critical Ops name or player ID.',
	type: STRING_OPTION,
	required: true,
	min_length: 1,
	max_length: 64,
};

const PRIVATE_RESPONSE_OPTION = {
	name: 'private',
	description: 'Only you can see the command response.',
	type: STRING_OPTION,
	required: false,
	choices: [{ name: 'True', value: 'true' }],
};

const PLAYER_TAG_CHOICES = [
	{ name: 'Verified', value: 'verified' },
	{ name: 'Partner', value: 'partner' },
	{ name: 'Developer', value: 'developer' },
	{ name: 'Creator', value: 'creator' },
	{ name: 'Competitive', value: 'competitive' },
	{ name: 'Organizer', value: 'organizer' },
];

function withPrivateResponseOption(command) {
	return {
		...command,
		options: [...(command.options || []), PRIVATE_RESPONSE_OPTION],
	};
}

// Keep this list in the same order and shape as src/commands/index.ts.
const commands = [
	withPrivateResponseOption({
		name: 'profile',
		description: 'Generate a shareable player profile card.',
		type: APPLICATION_COMMAND,
		options: [{ name: 'player', ...PLAYER_OPTION }],
		...USER_INSTALLABLE_CONTEXTS,
	}),
	{
		name: 'report',
		description: 'Send a player report to Patch staff for review.',
		type: APPLICATION_COMMAND,
		options: [
			{ name: 'player', ...PLAYER_OPTION },
			{
				name: 'proof',
				description: 'Image or video proof staff can review.',
				type: ATTACHMENT_OPTION,
				required: true,
			},
		],
		...USER_INSTALLABLE_CONTEXTS,
	},
	withPrivateResponseOption({
		name: 'stats',
		description: "Read a player's public stats in clean pages.",
		type: APPLICATION_COMMAND,
		options: [{ name: 'player', ...PLAYER_OPTION }],
		...USER_INSTALLABLE_CONTEXTS,
	}),
	{
		name: 'track',
		description: 'View tracked changes or add a player to your tracking dashboard.',
		type: APPLICATION_COMMAND,
		options: [{ name: 'player', ...PLAYER_OPTION, required: false }],
		...USER_INSTALLABLE_CONTEXTS,
	},
	withPrivateResponseOption({
		name: 'help',
		description: 'Open the Patch app dashboard.',
		type: APPLICATION_COMMAND,
		...USER_INSTALLABLE_CONTEXTS,
	}),
	withPrivateResponseOption({
		name: 'compare',
		description: 'Compare two players with current-season context.',
		type: APPLICATION_COMMAND,
		options: [
			{ name: 'player1', ...PLAYER_OPTION },
			{ name: 'player2', ...PLAYER_OPTION },
		],
		...USER_INSTALLABLE_CONTEXTS,
	}),
	{
		name: 'dev',
		description: 'Developer-only Patch tools.',
		type: APPLICATION_COMMAND,
		options: [
			{
				name: 'task',
				description: 'Cleanup task to run.',
				type: STRING_OPTION,
				required: true,
				choices: [
					{ name: 'Clear accepted report', value: 'report-clear' },
					{ name: 'Add player tag', value: 'tag-add' },
					{ name: 'Remove player tag', value: 'tag-remove' },
					{ name: 'Clear player tags', value: 'tag-clear' },
					{ name: 'Pause user reports', value: 'reports-pause' },
					{ name: 'Resume user reports', value: 'reports-resume' },
					{ name: 'Community recap', value: 'community-recap' },
				],
			},
			{
				name: 'target',
				description: 'Player name/ID, or Discord user ID/mention for report pauses.',
				type: STRING_OPTION,
				required: false,
				min_length: 1,
				max_length: 100,
			},
			{
				name: 'tag',
				description: 'Public tag for tag-add or tag-remove.',
				type: STRING_OPTION,
				required: false,
				choices: PLAYER_TAG_CHOICES,
			},
			{
				name: 'note',
				description: 'Staff note for pausing reports.',
				type: STRING_OPTION,
				required: false,
				min_length: 3,
				max_length: 200,
			},
		],
		...USER_INSTALLABLE_CONTEXTS,
	},
];

function requiredEnv(name, value) {
	if (!value || !value.trim()) {
		throw new Error(`Missing ${name}. Add it to ${path.join(__dirname, '.env')} or the current environment.`);
	}

	return value.trim();
}

function describeDiscordError(data) {
	if (typeof data === 'string') {
		return data;
	}

	if (data && typeof data === 'object') {
		const code = data.code ? `code ${data.code}: ` : '';
		return `${code}${data.message || JSON.stringify(data)}`;
	}

	return 'Discord returned an empty error response.';
}

async function main() {
	const applicationId = requiredEnv('DISCORD_APPLICATION_ID', process.env.DISCORD_APPLICATION_ID);
	const token = requiredEnv('DISCORD_BOT_TOKEN (or legacy DISCORD_TOKEN)', process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN);

	if (!/^\d+$/.test(applicationId)) {
		throw new Error('DISCORD_APPLICATION_ID must contain only digits.');
	}

	const response = await fetch(`https://discord.com/api/v10/applications/${applicationId}/commands`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bot ${token}`,
		},
		body: JSON.stringify(commands),
	});

	const bodyText = await response.text();
	let data;
	try {
		data = bodyText ? JSON.parse(bodyText) : undefined;
	} catch {
		data = bodyText;
	}

	if (!response.ok) {
		throw new Error(`Discord rejected the command registration (${response.status} ${response.statusText}): ${describeDiscordError(data)}`);
	}

	console.log(`Registered ${commands.length} global Discord commands.`);
}

main().catch((error) => {
	console.error(`Command registration failed: ${error.message}`);
	process.exitCode = 1;
});
