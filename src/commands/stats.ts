import type { CommandModule, CommandRuntime, DiscordInteraction, Env } from "../types";
import {
  EPHEMERAL,
  PLAYER_OPTION,
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
  type CriticalOpsProfile,
  EMBED_COLOR,
  accountCreatedEstimate,
  currentSeason,
  displayName,
  fetchProfileByPlayerOption,
  fieldValue,
  formatBan,
  formatClanMembership,
  formatOptionalInteger,
  formatRank,
  formatStats,
  kd,
  playerId,
  seasonByNumber,
  statField,
  sumStats,
  winRate,
} from "../lib/cops";
import { getAcceptedReport, getPlayerTagRecord } from "../lib/storage";
import { publicStatusFor } from "../lib/player-tags";
import { embedImage, pageFooter, quoteList, section } from "../lib/presentation";
import { withCommandPromotion } from "../lib/promotions";
import { recordProfileLookupSoon } from "../lib/lookup-counts";

const STATS_PAGE_LABELS = ["Overview", "Season", "All-Time"];

export const definition = {
  name: "stats",
  description: "Read a player's public stats in clean pages.",
  type: 1,
  options: [
    {
      name: "player",
      ...PLAYER_OPTION,
    },
  ],
  ...USER_INSTALLABLE_CONTEXTS,
} as const;

function statsMenu(profile: CriticalOpsProfile, selectedIndex = 0) {
  const id = playerId(profile) || encodeURIComponent(displayName(profile)).slice(0, 48);
  return pageMenu(`stats_page:${id}`, STATS_PAGE_LABELS, selectedIndex);
}

function plainPlayerId(profile: CriticalOpsProfile) {
  return playerId(profile) || "Unknown";
}

function singleLineClan(profile: CriticalOpsProfile) {
  return formatClanMembership(profile).replace(/\n/g, " - ");
}

export async function buildStatsEmbeds(
  profile: CriticalOpsProfile,
  env?: Env
) {
  const seasons = profile.stats?.seasonal_stats ?? [];
  const latestSeasonNumber = currentSeason(seasons);
  const latestSeason = seasonByNumber(seasons, latestSeasonNumber);
  const name = displayName(profile);
  const targetPlayerId = playerId(profile);
  const [report, tagRecord] = await Promise.all([
    getAcceptedReport(env || ({} as Env), targetPlayerId),
    getPlayerTagRecord(env || ({} as Env), targetPlayerId),
  ]);
  const status = publicStatusFor(report, tagRecord?.tags);
  const pages = STATS_PAGE_LABELS.length;
  const statusLines =
    status.kind === "report"
      ? [
          "Community status: **Report accepted**",
          `Public reason: **${status.reportReason}**`,
        ]
      : status.kind === "tags"
        ? [
            `Community status: **${status.label}**`,
            ...status.tags.map((tag) => `${tag.label}: ${tag.description}`),
          ]
        : [
            "Community status: **Secure**",
            "No accepted report or curated tag.",
          ];
  const ranked = profile.stats?.ranked;
  const rankedStats = latestSeason?.ranked;

  return [
    {
      title: `${name} overview`,
      color: status.kind === "secure" ? EMBED_COLOR : status.embedColor,
      description: [
        "## Quick read",
        quoteList([
          `IGN: **${name}**`,
          `ID: \`${plainPlayerId(profile)}\``,
          `Level: **${formatOptionalInteger(profile.basicInfo?.playerLevel?.level)}**`,
          `Clan: **${singleLineClan(profile)}**`,
        ]),
      ].join("\n"),
      image: embedImage("stats"),
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: "Ranked now",
          value: fieldValue(
            quoteList([
              `Rank: **${formatRank(ranked).split("\n")[0].replace("Rank: ", "")}**`,
              `MMR: **${formatOptionalInteger(ranked?.mmr)}**`,
              `Season K/D: **${kd(rankedStats)}**`,
              `Season win rate: **${winRate(rankedStats)}**`,
            ])
          ),
          inline: true,
        },
        {
          name: "Account",
          value: fieldValue(
            quoteList([
              accountCreatedEstimate(seasons),
              ...formatBan(profile.ban).split("\n"),
            ])
          ),
          inline: true,
        },
        {
          name: "Public status",
          value: fieldValue(
            section("Community read", quoteList(statusLines))
          ),
          inline: false,
        },
      ],
      footer: pageFooter(1, pages),
    },
    {
      title: `${name} season stats`,
      description: [
        "## Current season",
        quoteList([
          `Season: **${latestSeasonNumber ?? "Unknown"}**`,
          "Public mode stats, split out so the overview can breathe.",
        ]),
      ].join("\n"),
      color: EMBED_COLOR,
      image: embedImage("stats"),
      fields: [
        statField("Ranked", latestSeason?.ranked),
        statField("Casual", latestSeason?.casual),
        statField("Custom", latestSeason?.custom),
      ],
      footer: pageFooter(2, pages),
    },
    {
      title: `${name} public history`,
      description: [
        "## All-time public totals",
        quoteList([
          "Totals are summed from public seasonal stats.",
          "Good for trend checks; less useful for dramatic courtroom speeches.",
        ]),
      ].join("\n"),
      color: EMBED_COLOR,
      image: embedImage("stats"),
      fields: [
        statField("Ranked", sumStats(seasons, "ranked")),
        statField("Casual", sumStats(seasons, "casual")),
        statField("Custom", sumStats(seasons, "custom")),
      ],
      footer: pageFooter(3, pages, "public seasonal totals"),
    },
  ];
}

export async function handleStatsPage(interaction: DiscordInteraction, env: Env) {
  const customId = interaction.data?.custom_id || "";
  const page = Number(interaction.data?.values?.[0] || 0);
  const lookup = customId.replace("stats_page:", "");
  const profile = await fetchProfileByPlayerOption(decodeURIComponent(lookup));

  if (!profile) {
    return updateMessageResponse({
      content: "That player slipped out of the public data for now. Run `/stats` again with the name or ID.",
      embeds: [],
      components: [],
    });
  }

  const embeds = await buildStatsEmbeds(profile, env);
  const selected = Math.max(0, Math.min(embeds.length - 1, page));

  return updateMessageResponse({
    embeds: [embeds[selected]],
    components: statsMenu(profile, selected),
  });
}

async function editStatsResponse(
  interaction: DiscordInteraction,
  env: Env,
  player: string,
  waitUntil?: CommandRuntime["waitUntil"]
) {
  try {
    const profile = await fetchProfileByPlayerOption(player);

    if (!profile) {
      await editOriginalInteractionResponse(env, interaction.token, {
        content: "I couldn't find that player. Check the spelling or ID and send me back in.",
        embeds: [],
        components: [],
      });
      return;
    }

    recordProfileLookupSoon(env, profile, waitUntil);

    const [embeds, report] = await Promise.all([
      buildStatsEmbeds(profile, env),
      getAcceptedReport(env, playerId(profile)),
    ]);

    await editOriginalInteractionResponse(
      env,
      interaction.token,
      withCommandPromotion(
        {
          embeds: [embeds[0]],
          components: statsMenu(profile, 0),
        },
        { commandName: "stats", env, interaction, report }
      )
    );
  } catch (error) {
    console.error(error);
    await editOriginalInteractionResponse(env, interaction.token, {
      content: "Stats are having a quiet moment. Try again in a bit and I'll take another swing.",
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
  const player =
    optionValue(interaction.data?.options, "player") ||
    optionValue(interaction.data?.options, "ign") ||
    optionValue(interaction.data?.options, "player_id");

  if (!player) {
    return interactionResponse({
      content: "Drop a player first: `/stats player:<name-or-id>`.",
      flags: EPHEMERAL,
    });
  }

  runInBackground(runtime, () =>
    editStatsResponse(interaction, env, player, runtime?.waitUntil?.bind(runtime))
  );
  return deferredInteractionResponse();
}

export const statsCommand: CommandModule = {
  definition,
  handle,
};
