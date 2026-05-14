import type { CommandModule, CommandRuntime, DiscordInteraction, Env } from "../types";
import {
  EPHEMERAL,
  PLAYER_OPTION,
  USER_INSTALLABLE_CONTEXTS,
  actionRow,
  deferredInteractionResponse,
  editOriginalInteractionResponse,
  interactionResponse,
  interactionUserId,
  optionValue,
  runInBackground,
  stringSelect,
  updateMessageResponse,
} from "../lib/discord";
import {
  EMBED_COLOR,
  displayName,
  fetchProfileByPlayerOption,
  formatInteger,
  formatOptionalInteger,
  rankName,
} from "../lib/cops";
import {
  getTracker,
  putTracker,
  trackedPlayerFromProfile,
} from "../lib/storage";
import { embedImage, quoteList } from "../lib/presentation";
import { withCommandPromotion } from "../lib/promotions";
import { recordProfileLookupSoon } from "../lib/lookup-counts";

export const definition = {
  name: "track",
  description: "Track ranked changes and get weekly DM recaps.",
  type: 1,
  options: [
    {
      name: "player",
      ...PLAYER_OPTION,
    },
  ],
  ...USER_INSTALLABLE_CONTEXTS,
} as const;

function trackerListLines(record: Awaited<ReturnType<typeof getTracker>>) {
  if (record.players.length === 0) {
    return "> - Nobody on the watchlist yet.";
  }

  return record.players
    .map((player, index) => {
      const snapshot = player.lastSnapshot;
      return `> - **${index + 1}. ${player.label}** - ${snapshot?.rank || "No rank"} (${formatOptionalInteger(
        snapshot?.mmr
      )} MMR)`;
    })
    .join("\n");
}

export function weeklyUnsubscribeComponents(userId: string, record: Awaited<ReturnType<typeof getTracker>>) {
  const options = record.players.slice(0, 25).map((player) => ({
    label: player.label.slice(0, 100),
    value: player.key.slice(0, 100),
    description: `Remove ${player.lookup} from weekly recaps.`.slice(0, 100),
  }));

  if (options.length === 0) {
    return [];
  }

  return [
    actionRow([
      stringSelect(`track_unsub:${userId}`, "Trim your weekly watchlist", options),
    ]),
  ];
}

export async function handleTrackUnsubscribe(interaction: DiscordInteraction, env: Env) {
  const ownerId = (interaction.data?.custom_id || "").replace("track_unsub:", "");
  const userId = interactionUserId(interaction);
  const selected = interaction.data?.values?.[0];

  if (!userId || userId !== ownerId) {
    return interactionResponse({
      content: "That watchlist menu belongs to someone else. Your list is safe.",
      flags: EPHEMERAL,
    });
  }

  const record = await getTracker(env, userId);
  const before = record.players.length;
  record.players = record.players.filter((player) => player.key !== selected);
  await putTracker(env, record);

  return updateMessageResponse({
    embeds: [
      {
        title: "Weekly Watchlist",
        description:
          before === record.players.length
            ? "That player was already off the list."
            : "Removed the selected player from your weekly recap.",
        color: EMBED_COLOR,
        image: embedImage("track"),
        fields: [{ name: "Still tracked", value: trackerListLines(record) }],
      },
    ],
    components: weeklyUnsubscribeComponents(userId, record),
  });
}

async function editTrackAddResponse(
  interaction: DiscordInteraction,
  env: Env,
  userId: string,
  waitUntil?: CommandRuntime["waitUntil"]
) {
  try {
    const player = optionValue(interaction.data?.options, "player");
    if (!player) {
      await editOriginalInteractionResponse(env, interaction.token, {
        content: "Drop a player first: `/track player:<name-or-id>`.",
        embeds: [],
      });
      return;
    }

    const profile = await fetchProfileByPlayerOption(player);
    if (!profile) {
      await editOriginalInteractionResponse(env, interaction.token, {
        content: "I couldn't find that player. Check the spelling or ID and send me back in.",
        embeds: [],
      });
      return;
    }

    recordProfileLookupSoon(env, profile, waitUntil);

    const record = await getTracker(env, userId);
    const tracked = trackedPlayerFromProfile(player, profile);
    const existing = record.players.findIndex((item) => item.key === tracked.key);

    if (existing >= 0) {
      record.players[existing] = tracked;
    } else {
      if (record.players.length >= 25) {
        await editOriginalInteractionResponse(env, interaction.token, {
          content: "Your watchlist is full at 25 players. Trim one before adding another.",
          embeds: [],
        });
        return;
      }
      record.players.push(tracked);
    }

    await putTracker(env, record);

    await editOriginalInteractionResponse(
      env,
      interaction.token,
      withCommandPromotion(
        {
          embeds: [
            {
              title: "Weekly watchlist updated",
              description: quoteList([
                "I'll DM your ranked recap every Sunday at 18:00 Europe/Brussels.",
                "Only ranked changes are tracked, so the recap stays useful.",
              ]),
              color: EMBED_COLOR,
              image: embedImage("track"),
              fields: [
                { name: "Player", value: quoteList([displayName(profile)]), inline: true },
                { name: "Rank", value: quoteList([rankName(profile.stats?.ranked)]), inline: true },
                {
                  name: "Currently tracked",
                  value: trackerListLines(record),
                  inline: false,
                },
              ],
            },
          ],
        },
        { commandName: "track", env, interaction }
      )
    );
  } catch (error) {
    console.error(error);
    await editOriginalInteractionResponse(env, interaction.token, {
      content: "The watchlist is not saving right now. Give it a bit and try again.",
      embeds: [],
    });
  }
}

async function handle(
  interaction: DiscordInteraction,
  env: Env,
  runtime?: CommandRuntime
) {
  const userId = interactionUserId(interaction);
  if (!userId) {
    return interactionResponse({
      content: "I can't tell who owns this watchlist. Try again from your own Discord account.",
      flags: EPHEMERAL,
    });
  }

  if (!env.USER_PREFERENCES) {
    return interactionResponse({
      content: "Tracking needs storage before it can remember players. Ask the bot owner to hook up KV.",
      flags: EPHEMERAL,
    });
  }

  runInBackground(runtime, () =>
    editTrackAddResponse(interaction, env, userId, runtime?.waitUntil?.bind(runtime))
  );
  return deferredInteractionResponse({ flags: EPHEMERAL });
}

export const trackCommand: CommandModule = {
  definition,
  handle,
};
