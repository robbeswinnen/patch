import type { CommandModule, DiscordInteraction, Env } from "../types";
import {
  APPLICATION_COMMAND_OPTION_STRING,
  APPLICATION_COMMAND_OPTION_SUB_COMMAND,
  EPHEMERAL,
  PLAYER_OPTION,
  USER_INSTALLABLE_CONTEXTS,
  interactionResponse,
  interactionUserId,
  subcommand,
  subcommandOptionValue,
} from "../lib/discord";
import {
  addPlayerTag,
  deleteAcceptedReport,
  deleteReportBlacklistEntry,
  removePlayerTag,
  putReportBlacklistEntry,
} from "../lib/storage";
import {
  PLAYER_TAG_DEFINITIONS,
  PLAYER_TAG_BY_ID,
  parsePlayerTagId,
} from "../lib/player-tags";
import {
  displayName,
  fetchProfileByPlayerOption,
  playerId,
} from "../lib/cops";
import { clearPlayerCardLookupCaches } from "../lib/profile-card-cache";

export const definition = {
  name: "dev",
  description: "Developer-only Patch tools.",
  type: 1,
  options: [
    {
      name: "remove-report",
      description: "Remove an accepted player report.",
      type: APPLICATION_COMMAND_OPTION_SUB_COMMAND,
      options: [
        {
          name: "player",
          ...PLAYER_OPTION,
        },
      ],
    },
    {
      name: "tag",
      description: "Assign or remove a public player tag.",
      type: APPLICATION_COMMAND_OPTION_SUB_COMMAND,
      options: [
        {
          name: "player",
          ...PLAYER_OPTION,
        },
        {
          name: "action",
          description: "Tag action.",
          type: APPLICATION_COMMAND_OPTION_STRING,
          required: true,
          choices: [
            {
              name: "Add",
              value: "add",
            },
            {
              name: "Remove",
              value: "remove",
            },
          ],
        },
        {
          name: "tag",
          description: "Public tag to add or remove.",
          type: APPLICATION_COMMAND_OPTION_STRING,
          required: true,
          choices: [
            ...PLAYER_TAG_DEFINITIONS.map((tag) => ({
              name: tag.label,
              value: tag.id,
            })),
            {
              name: "All tags",
              value: "all",
            },
          ],
        },
      ],
    },
    {
      name: "report-blacklist",
      description: "Add or remove a user from report submissions.",
      type: APPLICATION_COMMAND_OPTION_SUB_COMMAND,
      options: [
        {
          name: "user",
          description: "Discord user ID to add or remove.",
          type: APPLICATION_COMMAND_OPTION_STRING,
          required: true,
          min_length: 1,
          max_length: 64,
        },
        {
          name: "action",
          description: "Blacklist action.",
          type: APPLICATION_COMMAND_OPTION_STRING,
          required: true,
          choices: [
            {
              name: "Add",
              value: "add",
            },
            {
              name: "Remove",
              value: "remove",
            },
          ],
        },
        {
          name: "reason",
          description: "Staff note for adding a blacklist entry.",
          type: APPLICATION_COMMAND_OPTION_STRING,
          required: false,
          min_length: 3,
          max_length: 200,
        },
      ],
    },
  ],
  ...USER_INSTALLABLE_CONTEXTS,
} as const;

async function handleRemoveReport(interaction: DiscordInteraction, env: Env) {
  const player = subcommandOptionValue(interaction, "player");

  if (!player) {
    return interactionResponse({
      content: "Give me the player to clear: `/dev remove-report player:<name-or-id>`.",
      flags: EPHEMERAL,
    });
  }

  const profile = await fetchProfileByPlayerOption(player);
  const targetPlayerId = profile ? playerId(profile) : /^\d+$/.test(player) ? player : undefined;
  const targetName = profile ? displayName(profile) : player;

  if (!targetPlayerId) {
    return interactionResponse({
      content: "I couldn't resolve that player ID, so I left the accepted reports untouched.",
      flags: EPHEMERAL,
    });
  }

  await deleteAcceptedReport(env, targetPlayerId);
  await clearPlayerCardLookupCaches(env, [player, targetPlayerId, targetName]);

  return interactionResponse({
    content: `Accepted report removed for **${targetName}**. Future stats and profile cards get a clean read.`,
    flags: EPHEMERAL,
  });
}

async function resolvePlayerTarget(player: string) {
  const profile = await fetchProfileByPlayerOption(player);
  const targetPlayerId = profile ? playerId(profile) : /^\d+$/.test(player) ? player : undefined;
  const targetName = profile ? displayName(profile) : player;

  return {
    targetPlayerId,
    targetName,
  };
}

async function handleTag(interaction: DiscordInteraction, env: Env) {
  const developerId = interactionUserId(interaction) || "unknown";
  const player = subcommandOptionValue(interaction, "player");
  const action = subcommandOptionValue(interaction, "action");
  const tagValue = subcommandOptionValue(interaction, "tag");
  const tag = parsePlayerTagId(tagValue);

  if (!player) {
    return interactionResponse({
      content: "Give me the player to tag: `/dev tag player:<name-or-id> action:<add|remove> tag:<tag>`.",
      flags: EPHEMERAL,
    });
  }

  if (!tag && tagValue !== "all") {
    return interactionResponse({
      content: "Pick one of the known public tags so Patch knows what badge to show.",
      flags: EPHEMERAL,
    });
  }

  const { targetPlayerId, targetName } = await resolvePlayerTarget(player);
  if (!targetPlayerId) {
    return interactionResponse({
      content: "I couldn't resolve that player ID, so I left the public tags untouched.",
      flags: EPHEMERAL,
    });
  }

  if (action === "add") {
    if (!tag) {
      return interactionResponse({
        content: "`All tags` is only for removal. Pick a specific tag to add.",
        flags: EPHEMERAL,
      });
    }

    await addPlayerTag(env, targetPlayerId, targetName, tag, developerId);
    await clearPlayerCardLookupCaches(env, [player, targetPlayerId, targetName]);

    return interactionResponse({
      content: `Added **${PLAYER_TAG_BY_ID[tag].label}** to **${targetName}**. Future stats and profile cards will show it.`,
      flags: EPHEMERAL,
    });
  }

  if (action === "remove") {
    await removePlayerTag(env, targetPlayerId, tag, developerId);
    await clearPlayerCardLookupCaches(env, [player, targetPlayerId, targetName]);

    return interactionResponse({
      content: tag
        ? `Removed **${PLAYER_TAG_BY_ID[tag].label}** from **${targetName}**.`
        : `Removed all public tags from **${targetName}**.`,
      flags: EPHEMERAL,
    });
  }

  return interactionResponse({
    content: "Pick `Add` or `Remove` so Patch knows what to do with the public tag.",
    flags: EPHEMERAL,
  });
}

async function handleReportBlacklist(interaction: DiscordInteraction, env: Env) {
  const developerId = interactionUserId(interaction) || "unknown";
  const userId = subcommandOptionValue(interaction, "user")?.replace(/[<@!>]/g, "");
  const action = subcommandOptionValue(interaction, "action");
  const reason = subcommandOptionValue(interaction, "reason");

  if (!userId || !/^\d+$/.test(userId)) {
    return interactionResponse({
      content: "Give me a Discord user ID, or a user mention I can turn into one.",
      flags: EPHEMERAL,
    });
  }

  if (action === "add") {
    await putReportBlacklistEntry(env, userId, developerId, reason);
    return interactionResponse({
      content: `Report submissions are now paused for <@${userId}>. The button has been gently put in timeout.`,
      flags: EPHEMERAL,
    });
  }

  if (action === "remove") {
    await deleteReportBlacklistEntry(env, userId);
    return interactionResponse({
      content: `Report submissions are open again for <@${userId}>. Fresh start, clean slate.`,
      flags: EPHEMERAL,
    });
  }

  return interactionResponse({
    content: "Pick `Add` or `Remove` so Patch knows what to do with the blacklist entry.",
    flags: EPHEMERAL,
  });
}

async function handle(
  interaction: DiscordInteraction,
  env: Env
) {
  const userId = interactionUserId(interaction);
  if (!env.DEVELOPER_DISCORD_USER_ID || userId !== env.DEVELOPER_DISCORD_USER_ID) {
    return interactionResponse({
      content: "That one is for the Patch dev seat.",
      flags: EPHEMERAL,
    });
  }

  if (!env.USER_PREFERENCES) {
    return interactionResponse({
      content: "Dev report tools need KV storage before they can tidy anything up.",
      flags: EPHEMERAL,
    });
  }

  const action = subcommand(interaction);
  if (action?.name === "remove-report") {
    return handleRemoveReport(interaction, env);
  }

  if (action?.name === "tag") {
    return handleTag(interaction, env);
  }

  if (action?.name === "report-blacklist") {
    return handleReportBlacklist(interaction, env);
  }

  return interactionResponse({
    content: "Use `/dev remove-report`, `/dev tag`, or `/dev report-blacklist` for the dev tools.",
    flags: EPHEMERAL,
  });
}

export const devCommand: CommandModule = {
  definition,
  handle,
};
