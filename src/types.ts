export interface Env {
  DISCORD_PUBLIC_KEY: string;
  DISCORD_BOT_TOKEN?: string;
  DISCORD_TOKEN?: string;
  DISCORD_APPLICATION_ID?: string;
  USER_PREFERENCES?: KVNamespace;
  SUPPORT_SERVER_URL?: string;
  WEBSITE_URL?: string;
  BOT_VERSION?: string;
  DEVELOPER_DISCORD_USER_ID?: string;
  SUPPORT_REPORT_CHANNEL_ID?: string;
}

export type DiscordUser = {
  id?: string;
  username?: string;
  global_name?: string | null;
};

export type DiscordOption = {
  name: string;
  type?: number;
  value?: string | number | boolean;
  options?: DiscordOption[];
};

export type DiscordAttachment = {
  id: string;
  filename?: string;
  description?: string;
  content_type?: string;
  size?: number;
  url?: string;
  proxy_url?: string;
};

export type DiscordInteraction = {
  id?: string;
  token?: string;
  type: number;
  channel_id?: string;
  user?: DiscordUser;
  member?: {
    user?: DiscordUser;
  };
  message?: {
    id?: string;
    channel_id?: string;
  };
  data?: {
    name?: string;
    custom_id?: string;
    values?: string[];
    options?: DiscordOption[];
    components?: DiscordComponent[];
    resolved?: {
      attachments?: Record<string, DiscordAttachment>;
    };
  };
};

export type DiscordEmbed = {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  thumbnail?: {
    url: string;
  };
  image?: {
    url: string;
  };
  author?: {
    name: string;
    icon_url?: string;
    url?: string;
  };
  footer?: {
    text: string;
    icon_url?: string;
  };
  timestamp?: string;
};

export type DiscordComponent = {
  type: number;
  custom_id?: string;
  label?: string;
  style?: number;
  disabled?: boolean;
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  min_length?: number;
  max_length?: number;
  required?: boolean;
  value?: string;
  description?: string;
  component?: DiscordComponent;
  options?: Array<{
    label: string;
    value: string;
    description?: string;
    default?: boolean;
  }>;
  components?: DiscordComponent[];
};

export type InteractionResponseData = {
  content?: string;
  custom_id?: string;
  title?: string;
  embeds?: DiscordEmbed[];
  components?: DiscordComponent[];
  attachments?: Array<{
    id: number;
    filename: string;
    description?: string;
  }>;
  flags?: number;
  allowed_mentions?: {
    parse?: string[];
  };
};

export type InteractionFile = {
  filename: string;
  contentType: string;
  body: string | Uint8Array | ArrayBuffer;
};

export type CommandDefinition = {
  name: string;
  description: string;
  type: 1;
  options?: readonly unknown[];
  integration_types: readonly number[];
  contexts: readonly number[];
  default_member_permissions?: string;
};

export type CommandRuntime = {
  waitUntil?: (promise: Promise<unknown>) => void;
};

export type CommandModule = {
  definition: CommandDefinition;
  handle: (
    interaction: DiscordInteraction,
    env: Env,
    runtime?: CommandRuntime
  ) => Promise<Response>;
};
