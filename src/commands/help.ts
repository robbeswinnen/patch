import type { CommandModule, DiscordInteraction, Env } from "../types";
import {
  USER_INSTALLABLE_CONTEXTS,
  interactionResponse,
} from "../lib/discord";
import { DEVELOPER_HANDLES, supportServerUrl } from "../lib/brand";
import { EMBED_COLOR } from "../lib/cops";
import { embedImage, quoteList } from "../lib/presentation";
import { withCommandPromotion } from "../lib/promotions";

const startedAt = Date.now();

function formatUptime(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m ${seconds % 60}s`;
}

function snowflakeTimestamp(id: string | undefined) {
  if (!id || !/^\d+$/.test(id)) {
    return undefined;
  }

  const timestamp = Number((BigInt(id) >> 22n) + 1420070400000n);
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

export const helpDefinition = {
  name: "help",
  description: "Patch help, status, and community links.",
  type: 1,
  ...USER_INSTALLABLE_CONTEXTS,
} as const;

async function handle(interaction: DiscordInteraction, env: Env) {
  const startedSeconds = Math.floor(startedAt / 1000);
  const interactionTimestamp = snowflakeTimestamp(interaction.id);
  const latency =
    typeof interactionTimestamp === "number"
      ? `${Math.max(0, Date.now() - interactionTimestamp)} ms`
      : "Available after deployment";

  return interactionResponse(
    withCommandPromotion(
      {
        embeds: [
          {
            title: "Patch Help",
            color: EMBED_COLOR,
            description: [
              "## Patch command desk",
              "Fast player reads, clean profile cards, and a staff-reviewed report lane when something looks off.",
            ].join("\n"),
            image: embedImage("help"),
            fields: [
              {
                name: "Player tools",
                value: quoteList([
                  "`/profile` - shareable player card.",
                  "`/stats` - overview first, deeper pages after.",
                  "`/compare` - current-season side-by-side.",
                  "`/track` - weekly ranked recap in DMs.",
                ]),
                inline: false,
              },
              {
                name: "Community tools",
                value: quoteList([
                  "`/clan` - leaderboard clan snapshot.",
                  "`/tags` - profile tag guide and applications.",
                  "`/report` - proof-backed staff review.",
                ]),
                inline: false,
              },
              {
                name: "Live bits",
                value: quoteList([
                  `Ping: **${latency}**`,
                  `Online: <t:${startedSeconds}:R>`,
                  `Support: ${supportServerUrl(env)}`,
                  `Developers: ${DEVELOPER_HANDLES.join(", ")}`,
                ]),
                inline: false,
              },
            ],
          },
        ],
      },
      { commandName: "help", env, interaction }
    )
  );
}

export const helpCommand: CommandModule = {
  definition: helpDefinition,
  handle,
};
