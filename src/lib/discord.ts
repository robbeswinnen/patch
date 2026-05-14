import type {
  CommandRuntime,
  DiscordComponent,
  DiscordInteraction,
  DiscordOption,
  DiscordAttachment,
  DiscordUser,
  Env,
  InteractionFile,
  InteractionResponseData,
} from "../types";

export const EPHEMERAL = 1 << 6;
export const APPLICATION_COMMAND = 2;
export const MESSAGE_COMPONENT = 3;
export const MODAL_SUBMIT = 5;
export const RESPONSE_CHANNEL_MESSAGE_WITH_SOURCE = 4;
export const RESPONSE_DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5;
export const RESPONSE_UPDATE_MESSAGE = 7;
export const RESPONSE_MODAL = 9;
export const APPLICATION_COMMAND_OPTION_STRING = 3;
export const APPLICATION_COMMAND_OPTION_SUB_COMMAND = 1;
export const APPLICATION_COMMAND_OPTION_ATTACHMENT = 11;
export const COMPONENT_ACTION_ROW = 1;
export const COMPONENT_BUTTON = 2;
export const COMPONENT_STRING_SELECT = 3;
export const COMPONENT_TEXT_INPUT = 4;
export const COMPONENT_LABEL = 18;
export const BUTTON_PRIMARY = 1;
export const BUTTON_SECONDARY = 2;
export const BUTTON_SUCCESS = 3;
export const BUTTON_DANGER = 4;
export const TEXT_INPUT_SHORT = 1;
export const TEXT_INPUT_PARAGRAPH = 2;

export const GUILD_INSTALL = 0;
export const USER_INSTALL = 1;
export const GUILD_CONTEXT = 0;
export const BOT_DM_CONTEXT = 1;
export const PRIVATE_CHANNEL_CONTEXT = 2;
export const USER_INSTALLABLE_CONTEXTS = {
  integration_types: [GUILD_INSTALL, USER_INSTALL],
  contexts: [GUILD_CONTEXT, BOT_DM_CONTEXT, PRIVATE_CHANNEL_CONTEXT],
};

export const PLAYER_OPTION = {
  description: "Critical Ops name or player ID.",
  type: APPLICATION_COMMAND_OPTION_STRING,
  required: true,
  min_length: 1,
  max_length: 64,
};

export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function interactionResponse(
  data: InteractionResponseData,
  type = RESPONSE_CHANNEL_MESSAGE_WITH_SOURCE
) {
  return jsonResponse({
    type,
    data,
  });
}

export function deferredInteractionResponse(data: InteractionResponseData = {}) {
  return interactionResponse(data, RESPONSE_DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE);
}

export function modalResponse(data: InteractionResponseData) {
  return interactionResponse(data, RESPONSE_MODAL);
}

export function runInBackground(
  runtime: CommandRuntime | undefined,
  job: () => Promise<unknown>
) {
  const promise = Promise.resolve().then(job);
  if (runtime?.waitUntil) {
    runtime.waitUntil(promise);
  } else {
    promise.catch((error) => console.error(error));
  }
  return promise;
}

function multipartPayload(
  payload: unknown,
  file: InteractionFile
) {
  const boundary = `discord-boundary-${crypto.randomUUID()}`;
  const fileHeader = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="payload_json"',
    "Content-Type: application/json",
    "",
    JSON.stringify(payload),
    `--${boundary}`,
    `Content-Disposition: form-data; name="files[0]"; filename="${file.filename}"`,
    `Content-Type: ${file.contentType}`,
    "",
  ].join("\r\n");
  const body = new Blob([
    `${fileHeader}\r\n`,
    file.body,
    `\r\n--${boundary}--\r\n`,
  ]);

  return {
    body,
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

export function multipartInteractionResponse(
  data: InteractionResponseData,
  file: InteractionFile,
  type = RESPONSE_CHANNEL_MESSAGE_WITH_SOURCE
) {
  const payload = multipartPayload({
    type,
    data,
  }, file);

  return new Response(payload.body, {
    headers: {
      "Content-Type": payload.contentType,
    },
  });
}

export function updateMessageResponse(data: InteractionResponseData) {
  return interactionResponse(data, RESPONSE_UPDATE_MESSAGE);
}

export function optionValue(options: DiscordOption[] | undefined, name: string) {
  const value = options?.find((option) => option.name === name)?.value;
  return typeof value === "string" ? value.trim() : undefined;
}

export function optionAttachment(
  interaction: DiscordInteraction,
  name: string
): DiscordAttachment | undefined {
  const value = interaction.data?.options?.find((option) => option.name === name)?.value;
  const attachmentId = typeof value === "string" ? value : undefined;
  return attachmentId ? interaction.data?.resolved?.attachments?.[attachmentId] : undefined;
}

export function subcommand(interaction: DiscordInteraction) {
  return interaction.data?.options?.find((option) => option.type === 1);
}

export function subcommandOptionValue(
  interaction: DiscordInteraction,
  name: string
) {
  return optionValue(subcommand(interaction)?.options, name);
}

export function interactionUser(interaction: DiscordInteraction): DiscordUser | undefined {
  return interaction.user || interaction.member?.user;
}

export function interactionUserId(interaction: DiscordInteraction) {
  return interactionUser(interaction)?.id;
}

export function interactionUserLabel(interaction: DiscordInteraction) {
  const user = interactionUser(interaction);
  return user?.global_name || user?.username || (user?.id ? `User ${user.id}` : "Unknown user");
}

export function actionRow(components: DiscordComponent[]): DiscordComponent {
  return {
    type: COMPONENT_ACTION_ROW,
    components,
  };
}

export function textInput(
  customId: string,
  style: number,
  options: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    value?: string;
  } = {}
): DiscordComponent {
  return {
    type: COMPONENT_TEXT_INPUT,
    custom_id: customId,
    style,
    min_length: options.minLength,
    max_length: options.maxLength,
    required: options.required ?? true,
    value: options.value,
  };
}

export function labelComponent(
  label: string,
  component: DiscordComponent,
  description?: string
): DiscordComponent {
  return {
    type: COMPONENT_LABEL,
    label,
    description,
    component,
  };
}

function findComponentValue(
  components: DiscordComponent[] | undefined,
  customId: string
): string | undefined {
  for (const component of components || []) {
    if (component.custom_id === customId && typeof component.value === "string") {
      return component.value.trim();
    }

    const nested = findComponentValue(component.components, customId);
    if (nested !== undefined) {
      return nested;
    }

    const labeled = findComponentValue(
      component.component ? [component.component] : undefined,
      customId
    );
    if (labeled !== undefined) {
      return labeled;
    }
  }

  return undefined;
}

export function modalValue(interaction: DiscordInteraction, customId: string) {
  return findComponentValue(interaction.data?.components, customId);
}

export function button(
  customId: string,
  label: string,
  style = BUTTON_SECONDARY,
  disabled = false
): DiscordComponent {
  return {
    type: COMPONENT_BUTTON,
    custom_id: customId,
    label,
    style,
    disabled,
  };
}

export function stringSelect(
  customId: string,
  placeholder: string,
  options: NonNullable<DiscordComponent["options"]>
): DiscordComponent {
  return {
    type: COMPONENT_STRING_SELECT,
    custom_id: customId,
    placeholder,
    min_values: 1,
    max_values: 1,
    options,
  };
}

export function pageMenu(
  customId: string,
  pageLabels: string[],
  selectedIndex: number
) {
  return [
    actionRow([
      stringSelect(
        customId,
        "Pick a page",
        pageLabels.map((label, index) => ({
          label,
          value: String(index),
          default: index === selectedIndex,
        }))
      ),
    ]),
  ];
}

export function discordBotToken(env: Env) {
  return env.DISCORD_BOT_TOKEN || env.DISCORD_TOKEN;
}

export async function discordApi<T>(
  env: Env,
  route: string,
  init: RequestInit = {}
) {
  const botToken = discordBotToken(env);

  if (!botToken) {
    throw new Error("Missing DISCORD_BOT_TOKEN or DISCORD_TOKEN");
  }

  const response = await fetch(`https://discord.com/api/v10/${route}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${botToken}`,
      ...(init.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    throw new Error(`Discord API ${route} failed: ${response.status} ${text}`);
  }

  return data as T;
}

export async function editOriginalInteractionResponse(
  env: Env,
  interactionToken: string | undefined,
  data: InteractionResponseData,
  file?: InteractionFile
) {
  if (!env.DISCORD_APPLICATION_ID || !interactionToken) {
    throw new Error("Missing interaction webhook credentials");
  }

  const route = `webhooks/${env.DISCORD_APPLICATION_ID}/${interactionToken}/messages/@original`;
  const init: RequestInit = {
    method: "PATCH",
  };

  if (file) {
    const payload = multipartPayload(data, file);
    init.body = payload.body;
    init.headers = {
      "Content-Type": payload.contentType,
    };
  } else {
    init.body = JSON.stringify(data);
    init.headers = {
      "Content-Type": "application/json",
    };
  }

  const response = await fetch(`https://discord.com/api/v10/${route}`, init);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Discord webhook edit failed: ${response.status} ${text}`);
  }

  return text ? JSON.parse(text) : undefined;
}

export async function createDm(env: Env, userId: string) {
  return discordApi<{ id: string }>(env, "users/@me/channels", {
    method: "POST",
    body: JSON.stringify({ recipient_id: userId }),
  });
}

export async function sendDiscordMessage(
  env: Env,
  channelId: string,
  data: InteractionResponseData
) {
  return discordApi(env, `channels/${channelId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      ...data,
      allowed_mentions: data.allowed_mentions || { parse: [] },
    }),
  });
}

export async function sendDiscordDm(
  env: Env,
  userId: string,
  data: InteractionResponseData
) {
  const dm = await createDm(env, userId);
  return sendDiscordMessage(env, dm.id, data);
}
