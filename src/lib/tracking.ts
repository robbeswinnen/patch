import type { Env, InteractionResponseData } from "../types";
import {
  createDm,
  discordBotToken,
  sendDiscordMessage,
} from "./discord";
import {
  EMBED_COLOR,
  fetchProfileByPlayerOption,
  formatInteger,
  formatOptionalInteger,
} from "./cops";
import { embedImage, quoteList } from "./presentation";
import {
  listTrackers,
  putTracker,
  snapshotDelta,
  snapshotProfile,
} from "./storage";
import { weeklyUnsubscribeComponents } from "../commands/track";

function signed(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "N/A";
  }

  if (value > 0) {
    return `+${formatInteger(value)}`;
  }

  return formatInteger(value);
}

export async function sendWeeklyRankedUpdates(env: Env) {
  if (!env.USER_PREFERENCES || !discordBotToken(env)) {
    console.warn("Skipping weekly tracking: storage or bot token missing.");
    return;
  }

  const trackers = await listTrackers(env);

  for (const record of trackers) {
    if (record.players.length === 0) {
      continue;
    }

    const fields: NonNullable<InteractionResponseData["embeds"]>[number]["fields"] = [];

    for (const tracked of record.players) {
      try {
        const profile = await fetchProfileByPlayerOption(tracked.lookup);
        if (!profile) {
          fields.push({
            name: tracked.label,
            value: quoteList(["Could not refresh this player from public data this week."]),
            inline: false,
          });
          continue;
        }

        const next = snapshotProfile(profile);
        const delta = snapshotDelta(tracked.lastSnapshot, next);
        fields.push({
          name: tracked.label,
          value: quoteList([
            `Kills: ${formatInteger(next.kills)} (${signed(delta.kills)})`,
            `Deaths: ${formatInteger(next.deaths)} (${signed(delta.deaths)})`,
            `Rating: ${formatOptionalInteger(next.mmr)} MMR (${signed(delta.mmr)})`,
            `Rank: ${next.rank}${
              delta.rankChanged ? ` (was ${tracked.lastSnapshot?.rank})` : ""
            }`,
            `Level: ${formatOptionalInteger(next.level)} (${signed(delta.level)})`,
          ]),
          inline: false,
        });

        tracked.lastSnapshot = next;
        tracked.label = profile.basicInfo?.name || tracked.label;
        tracked.lookup = profile.basicInfo?.userID ? String(profile.basicInfo.userID) : tracked.lookup;
      } catch (error) {
        console.error(error);
        fields.push({
          name: tracked.label,
          value: quoteList(["Refresh failed this week. Keeping the old snapshot for now."]),
          inline: false,
        });
      }
    }

    await putTracker(env, record);

    try {
      const dm = await createDm(env, record.userId);
      await sendDiscordMessage(env, dm.id, {
        embeds: [
          {
            title: "Weekly Ranked Recap",
            description: quoteList([
              "Ranked-only changes since the last snapshot.",
              "Small moves count; the weekly view keeps them visible.",
            ]),
            color: EMBED_COLOR,
            image: embedImage("track"),
            fields: fields.slice(0, 25),
            timestamp: new Date().toISOString(),
          },
        ],
        components: weeklyUnsubscribeComponents(record.userId, record),
      });
    } catch (error) {
      console.error(error);
    }
  }
}

function brusselsDateParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Brussels",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value;

  return {
    weekday: value("weekday"),
    hour: value("hour"),
    date: `${value("year")}-${value("month")}-${value("day")}`,
  };
}

export async function runScheduledRankedUpdates(env: Env, now = new Date()) {
  const parts = brusselsDateParts(now);
  if (parts.weekday !== "Sun" || parts.hour !== "18") {
    return;
  }

  const key = `track:last-weekly-report:${parts.date}`;
  if (env.USER_PREFERENCES && (await env.USER_PREFERENCES.get(key))) {
    return;
  }

  await env.USER_PREFERENCES?.put(key, "sent", {
    expirationTtl: 8 * 24 * 60 * 60,
  });
  await sendWeeklyRankedUpdates(env);
}
