import type { CommandModule, CommandRuntime, DiscordEmbed, DiscordInteraction, Env } from "../types";
import {
  APPLICATION_COMMAND_OPTION_STRING,
  EPHEMERAL,
  USER_INSTALLABLE_CONTEXTS,
  deferredInteractionResponse,
  editOriginalInteractionResponse,
  interactionResponse,
  optionValue,
  pageMenu,
  runInBackground,
  updateMessageResponse,
} from "../lib/discord";
import {
  type ClanLeaderboardEntry,
  EMBED_COLOR,
  fetchClanLeaderboard,
  fieldValue,
  findClan,
  formatDecimal,
  formatInteger,
  formatPercentValue,
  optionalNumber,
  winRateValue,
} from "../lib/cops";
import { embedImage, pageFooter, quoteList } from "../lib/presentation";
import { withCommandPromotion } from "../lib/promotions";

const CLAN_PAGE_LABELS = ["Overview", "Performance"];

export const definition = {
  name: "clan",
  description: "Look up a leaderboard clan by name or tag.",
  type: 1,
  options: [
    {
      name: "query",
      description: "Clan name or tag.",
      type: APPLICATION_COMMAND_OPTION_STRING,
      required: true,
      min_length: 1,
      max_length: 64,
    },
  ],
  ...USER_INSTALLABLE_CONTEXTS,
} as const;

function clanTitle(clan: ClanLeaderboardEntry) {
  const tag = clan.tag ? ` [${clan.tag}]` : "";
  return `${clan.name || "Unknown clan"}${tag}`;
}

function clanStrength(clan: ClanLeaderboardEntry) {
  const rating = Number(clan.rating || 0);
  const averageRating = Number(clan.average_rating || 0);
  const kdr = Number(clan.kdr || 0);
  const wlr = Number(clan.wlr || 0);
  const parts = [];

  if (rating >= 50_000 || averageRating >= 1700) {
    parts.push("High ranked strength");
  } else if (rating >= 25_000 || averageRating >= 1400) {
    parts.push("Solid ranked strength");
  } else {
    parts.push("Developing ranked strength");
  }

  if (kdr >= 1.15) {
    parts.push("positive fragging");
  } else if (kdr >= 1) {
    parts.push("even fragging");
  } else {
    parts.push("fragging under pressure");
  }

  if (wlr >= 1.25) {
    parts.push("strong match conversion");
  } else if (wlr >= 1) {
    parts.push("steady match conversion");
  } else {
    parts.push("negative match conversion");
  }

  return parts.join(", ");
}

function clanMenu(clan: ClanLeaderboardEntry, selectedIndex = 0) {
  const key = encodeURIComponent(clan.tag || clan.name || "clan").slice(0, 48);
  return pageMenu(`clan_page:${key}`, CLAN_PAGE_LABELS, selectedIndex);
}

export function buildClanEmbeds(clan: ClanLeaderboardEntry): DiscordEmbed[] {
  const title = clanTitle(clan);

  return [
    {
      title: title,
      color: EMBED_COLOR,
      image: embedImage("clan"),
      description: [
        "## Clan board check",
        quoteList([
          `Leaderboard rank: **#${formatInteger(clan.rank)}**`,
          `Players: **${formatInteger(clan.players)}**`,
          `Total rating: **${formatInteger(clan.rating)}**`,
          `Average rating: **${formatDecimal(optionalNumber(clan.average_rating))}**`,
          `Read: ${clanStrength(clan)}`,
        ]),
        "",
        `**Community note**\n${quoteList([
          `This is a quick public snapshot for **${title}**.`,
          "Leaderboards move fast, so refresh before making the read final.",
        ])}`,
      ].join("\n"),
      timestamp: new Date().toISOString(),
      footer: pageFooter(1, 2),
    },
    {
      title: `${title} performance`,
      color: EMBED_COLOR,
      description: [
        "## Combat and match shape",
        quoteList([
          "A little scoreboard reading, a little server-side curiosity.",
          "Use it to spot trends, not to settle every server argument.",
        ]),
      ].join("\n"),
      image: embedImage("clan"),
      fields: [
        {
          name: "Combat",
          value: fieldValue([
            `> - Kills: ${formatInteger(clan.kills)}`,
            `> - Deaths: ${formatInteger(clan.deaths)}`,
            `> - Assists: ${formatInteger(clan.assists)}`,
            `> - K/D: ${formatDecimal(optionalNumber(clan.kdr))}`,
          ].join("\n")),
          inline: true,
        },
        {
          name: "Matches",
          value: fieldValue([
            `> - Wins: ${formatInteger(clan.wins)}`,
            `> - Losses: ${formatInteger(clan.losses)}`,
            `> - W/L ratio: ${formatDecimal(optionalNumber(clan.wlr))}`,
            `> - Win rate: ${formatPercentValue(
              winRateValue({ w: clan.wins, l: clan.losses })
            )}`,
          ].join("\n")),
          inline: true,
        },
      ],
      footer: pageFooter(2, 2),
    },
  ];
}

export async function handleClanPage(interaction: DiscordInteraction) {
  const customId = interaction.data?.custom_id || "";
  const page = Number(interaction.data?.values?.[0] || 0);
  const lookup = decodeURIComponent(customId.replace("clan_page:", ""));
  const clan = findClan(await fetchClanLeaderboard(), lookup);

  if (!clan) {
    return updateMessageResponse({
      content: "That clan is not showing up on the public board right now. Try the command again with the name or tag.",
      embeds: [],
      components: [],
    });
  }

  const embeds = buildClanEmbeds(clan);
  const selected = Math.max(0, Math.min(embeds.length - 1, page));

  return updateMessageResponse({
    embeds: [embeds[selected]],
    components: clanMenu(clan, selected),
  });
}

async function editClanResponse(
  interaction: DiscordInteraction,
  env: Env,
  clanSearch: string
) {
  try {
    const clan = findClan(await fetchClanLeaderboard(), clanSearch);

    if (!clan) {
      await editOriginalInteractionResponse(env, interaction.token, {
        content:
          "I couldn't find that clan on the public leaderboard. Try the exact name or tag and I'll check again.",
        embeds: [],
        components: [],
      });
      return;
    }

    const embeds = buildClanEmbeds(clan);
    await editOriginalInteractionResponse(
      env,
      interaction.token,
      withCommandPromotion(
        {
          embeds: [embeds[0]],
          components: clanMenu(clan, 0),
        },
        { commandName: "clan", env, interaction }
      )
    );
  } catch (error) {
    console.error(error);
    await editOriginalInteractionResponse(env, interaction.token, {
      content: "Clan stats are slow right now. Give it a bit and try again.",
      embeds: [],
      components: [],
    });
  }
}

async function handle(
  interaction: DiscordInteraction,
  env: Env,
  runtime?: CommandRuntime
) {
  const clanSearch =
    optionValue(interaction.data?.options, "query") ||
    optionValue(interaction.data?.options, "clan");

  if (!clanSearch) {
    return interactionResponse({
      content: "Drop a clan first: `/clan query:<name-or-tag>`.",
      flags: EPHEMERAL,
    });
  }

  runInBackground(runtime, () => editClanResponse(interaction, env, clanSearch));
  return deferredInteractionResponse();
}

export const clanCommand: CommandModule = {
  definition,
  handle,
};
