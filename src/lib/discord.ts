// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.

const EPHEMERAL = 1 << 6;
const IS_COMPONENTS_V2 = 1 << 15;
const APPLICATION_COMMAND = 2;
const MESSAGE_COMPONENT = 3;
const MODAL_SUBMIT = 5;
const RESPONSE_CHANNEL_MESSAGE_WITH_SOURCE = 4;
const RESPONSE_DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5;
const RESPONSE_DEFERRED_UPDATE_MESSAGE = 6;
const RESPONSE_UPDATE_MESSAGE = 7;
const RESPONSE_MODAL = 9;
const APPLICATION_COMMAND_OPTION_STRING = 3;
const APPLICATION_COMMAND_OPTION_ATTACHMENT = 11;
const COMPONENT_ACTION_ROW = 1;
const COMPONENT_BUTTON = 2;
const COMPONENT_STRING_SELECT = 3;
const COMPONENT_TEXT_INPUT = 4;
const COMPONENT_SECTION = 9;
const COMPONENT_TEXT_DISPLAY = 10;
const COMPONENT_MEDIA_GALLERY = 12;
const COMPONENT_SEPARATOR = 14;
const COMPONENT_CONTAINER = 17;
const COMPONENT_LABEL = 18;
const BUTTON_SECONDARY = 2;
const TEXT_INPUT_SHORT = 1;
const TEXT_INPUT_PARAGRAPH = 2;
const GUILD_INSTALL = 0;
const USER_INSTALL = 1;
const GUILD_CONTEXT = 0;
const BOT_DM_CONTEXT = 1;
const PRIVATE_CHANNEL_CONTEXT = 2;
const USER_INSTALLABLE_CONTEXTS = {
	integration_types: [GUILD_INSTALL, USER_INSTALL],
	contexts: [GUILD_CONTEXT, BOT_DM_CONTEXT, PRIVATE_CHANNEL_CONTEXT],
};
const PLAYER_OPTION = {
	description: 'Critical Ops name or player ID.',
	type: APPLICATION_COMMAND_OPTION_STRING,
	required: true,
	min_length: 1,
	max_length: 64,
};
const PRIVATE_RESPONSE_OPTION_NAME = 'private';
const PRIVATE_RESPONSE_OPTION = {
	name: PRIVATE_RESPONSE_OPTION_NAME,
	description: 'Only you can see the command response.',
	type: APPLICATION_COMMAND_OPTION_STRING,
	required: false,
	choices: [
		{
			name: 'True',
			value: 'true',
		},
	],
};
function withPrivateResponseOption(definition) {
	const options = definition.options || [];
	const hasPrivateOption = options.some((option) => {
		return typeof option === 'object' && option !== null && 'name' in option && option.name === PRIVATE_RESPONSE_OPTION_NAME;
	});
	if (hasPrivateOption) {
		return definition;
	}
	return {
		...definition,
		options: [...options, PRIVATE_RESPONSE_OPTION],
	};
}

function jsonResponse(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

function interactionResponse(data, type = RESPONSE_CHANNEL_MESSAGE_WITH_SOURCE) {
	return jsonResponse({
		type,
		data,
	});
}

function withEphemeralFlag(data = {}) {
	return {
		...data,
		flags: (data.flags || 0) | EPHEMERAL,
	};
}

function privateResponseRequested(interaction) {
	return (
		interaction.data?.options?.some((option) => {
			return option.name === PRIVATE_RESPONSE_OPTION_NAME && (option.value === true || option.value === 'true');
		}) || false
	);
}

async function applyPrivateResponseOption(interaction, response) {
	if (!privateResponseRequested(interaction)) {
		return response;
	}
	try {
		const payload = await response.clone().json();
		if (payload.type === RESPONSE_DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE) {
			return jsonResponse(
				{
					...payload,
					data: {
						...payload.data,
						flags: EPHEMERAL,
					},
				},
				response.status,
			);
		}
		if (payload.type === RESPONSE_CHANNEL_MESSAGE_WITH_SOURCE) {
			return jsonResponse(
				{
					...payload,
					data: withEphemeralFlag(payload.data),
				},
				response.status,
			);
		}
	} catch {
		return response;
	}
	return response;
}

function deferredInteractionResponse(data = {}) {
	return interactionResponse(data, RESPONSE_DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE);
}

function deferredUpdateMessageResponse() {
	return interactionResponse({}, RESPONSE_DEFERRED_UPDATE_MESSAGE);
}

function modalResponse(data) {
	return interactionResponse(data, RESPONSE_MODAL);
}

function runInBackground(runtime, job) {
	const promise = Promise.resolve().then(job);
	if (runtime?.waitUntil) {
		runtime.waitUntil(promise.catch((error) => console.error(error)));
	} else {
		promise.catch((error) => console.error(error));
	}
	return promise;
}

function multipartPayload(payload, fileOrFiles) {
	const boundary = `discord-boundary-${crypto.randomUUID()}`;
	const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
	const parts = [
		[
			`--${boundary}`,
			'Content-Disposition: form-data; name="payload_json"',
			'Content-Type: application/json',
			'',
			JSON.stringify(payload),
		].join('\r\n'),
	];
	files.forEach((file, index) => {
		parts.push(
			[
				'',
				`--${boundary}`,
				`Content-Disposition: form-data; name="files[${index}]"; filename="${file.filename}"`,
				`Content-Type: ${file.contentType}`,
				'',
				'',
			].join('\r\n'),
			file.body,
		);
	});
	parts.push(`\r
--${boundary}--\r
`);
	const body = new Blob(parts);
	return {
		body,
		contentType: `multipart/form-data; boundary=${boundary}`,
	};
}

function updateMessageResponse(data) {
	return interactionResponse(data, RESPONSE_UPDATE_MESSAGE);
}

function optionValue(options, name) {
	const value = options?.find((option) => option.name === name)?.value;
	return typeof value === 'string' ? value.trim() : undefined;
}

function optionAttachment(interaction, name) {
	const value = interaction.data?.options?.find((option) => option.name === name)?.value;
	const attachmentId = typeof value === 'string' ? value : undefined;
	return attachmentId ? interaction.data?.resolved?.attachments?.[attachmentId] : undefined;
}

function interactionUser(interaction) {
	return interaction.user || interaction.member?.user;
}

function interactionUserId(interaction) {
	return interactionUser(interaction)?.id;
}

function actionRow(components) {
	return {
		type: COMPONENT_ACTION_ROW,
		components,
	};
}

function textInput(customIdValue, style, options = {}) {
	return {
		type: COMPONENT_TEXT_INPUT,
		custom_id: customIdValue,
		style,
		min_length: options.minLength,
		max_length: options.maxLength,
		required: options.required ?? true,
		value: options.value,
	};
}

function labelComponent(label, component, description) {
	return {
		type: COMPONENT_LABEL,
		label,
		description,
		component,
	};
}

function findComponentValue(components, customIdValue) {
	for (const component of components || []) {
		if (component.custom_id === customIdValue && typeof component.value === 'string') {
			return component.value.trim();
		}
		const nested = findComponentValue(component.components, customIdValue);
		if (nested !== undefined) {
			return nested;
		}
		const labeled = findComponentValue(component.component ? [component.component] : undefined, customIdValue);
		if (labeled !== undefined) {
			return labeled;
		}
	}
	return undefined;
}

function modalValue(interaction, customIdValue) {
	return findComponentValue(interaction.data?.components, customIdValue);
}

function button(customIdValue, label, style = BUTTON_SECONDARY, disabled = false) {
	return {
		type: COMPONENT_BUTTON,
		custom_id: customIdValue,
		label,
		style,
		disabled,
	};
}

function stringSelect(customIdValue, placeholder, options) {
	return {
		type: COMPONENT_STRING_SELECT,
		custom_id: customIdValue,
		placeholder,
		min_values: 1,
		max_values: 1,
		options,
	};
}

function pageMenu(customIdValue, pageLabels, selectedIndex) {
	return [
		actionRow([
			stringSelect(
				customIdValue,
				'Pick a page',
				pageLabels.map((label, index) => ({
					label,
					value: String(index),
					default: index === selectedIndex,
				})),
			),
		]),
	];
}

function discordBotToken(env) {
	return env.DISCORD_BOT_TOKEN || env.DISCORD_TOKEN;
}

async function discordApi(env, route, init = {}) {
	const botToken = discordBotToken(env);
	if (!botToken) {
		throw new Error('Missing DISCORD_BOT_TOKEN or DISCORD_TOKEN');
	}
	const response = await fetch(`https://discord.com/api/v10/${route}`, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bot ${botToken}`,
			...(init.headers || {}),
		},
	});
	const responseText = await response.text();
	const data = responseText ? JSON.parse(responseText) : undefined;
	if (!response.ok) {
		throw new Error(`Discord API ${route} failed: ${response.status} ${responseText}`);
	}
	return data;
}

async function editOriginalInteractionResponse(env, interactionToken, data, file) {
	if (!env.DISCORD_APPLICATION_ID || !interactionToken) {
		throw new Error('Missing interaction webhook credentials');
	}
	const route = `webhooks/${env.DISCORD_APPLICATION_ID}/${interactionToken}/messages/@original`;
	const usesComponentsV2 = Boolean((data.flags || 0) & IS_COMPONENTS_V2);
	const init = {
		method: 'PATCH',
	};
	if (file) {
		const payload = multipartPayload(data, file);
		init.body = payload.body;
		init.headers = {
			'Content-Type': payload.contentType,
		};
	} else {
		init.body = JSON.stringify(data);
		init.headers = {
			'Content-Type': 'application/json',
		};
	}
	const response = await fetch(`https://discord.com/api/v10/${route}${usesComponentsV2 ? '?with_components=true' : ''}`, init);
	const responseText = await response.text();
	if (!response.ok) {
		throw new Error(`Discord webhook edit failed: ${response.status} ${responseText}`);
	}
	return responseText ? JSON.parse(responseText) : undefined;
}

async function createDm(env, userId) {
	return discordApi(env, 'users/@me/channels', {
		method: 'POST',
		body: JSON.stringify({ recipient_id: userId }),
	});
}

async function sendDiscordMessage(env, channelId, data) {
	return discordApi(env, `channels/${channelId}/messages`, {
		method: 'POST',
		body: JSON.stringify({
			...data,
			allowed_mentions: data.allowed_mentions || { parse: [] },
		}),
	});
}

async function sendDiscordDm(env, userId, data) {
	const dm = await createDm(env, userId);
	return sendDiscordMessage(env, dm.id, data);
}

export {
	APPLICATION_COMMAND,
	APPLICATION_COMMAND_OPTION_ATTACHMENT,
	APPLICATION_COMMAND_OPTION_STRING,
	BUTTON_SECONDARY,
	COMPONENT_CONTAINER,
	COMPONENT_MEDIA_GALLERY,
	COMPONENT_SECTION,
	COMPONENT_SEPARATOR,
	COMPONENT_TEXT_DISPLAY,
	EPHEMERAL,
	IS_COMPONENTS_V2,
	MESSAGE_COMPONENT,
	MODAL_SUBMIT,
	PLAYER_OPTION,
	TEXT_INPUT_PARAGRAPH,
	TEXT_INPUT_SHORT,
	USER_INSTALLABLE_CONTEXTS,
	actionRow,
	applyPrivateResponseOption,
	button,
	deferredInteractionResponse,
	deferredUpdateMessageResponse,
	discordBotToken,
	editOriginalInteractionResponse,
	interactionResponse,
	interactionUserId,
	jsonResponse,
	labelComponent,
	modalResponse,
	modalValue,
	optionAttachment,
	optionValue,
	pageMenu,
	runInBackground,
	sendDiscordDm,
	sendDiscordMessage,
	stringSelect,
	textInput,
	updateMessageResponse,
	withEphemeralFlag,
	withPrivateResponseOption,
};
