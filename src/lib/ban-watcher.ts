import type { Env, InteractionResponseData } from "../types";
import type { PlayerReport } from "./cops";
import {
  EMBED_COLOR,
  displayName,
  fetchProfileByPlayerOption,
  formatBan,
  hasActiveBan,
} from "./cops";
import { discordBotToken, sendDiscordDm } from "./discord";
import {
  listAcceptedReports,
  putAcceptedReport,
  type PendingReport,
} from "./storage";
import { embedImage, quoteList } from "./presentation";

const BAN_WATCH_RECHECK_MS = 6 * 60 * 60 * 1000;
const MAX_BAN_WATCH_CHECKS_PER_RUN = 20;

export type BanWatcherResult = {
  checked: number;
  banned: number;
  notified: number;
  skipped: number;
};

function recentEnough(isoDate: string | undefined, now: Date) {
  if (!isoDate) {
    return false;
  }

  const checkedAt = Date.parse(isoDate);
  return Number.isFinite(checkedAt) && now.getTime() - checkedAt < BAN_WATCH_RECHECK_MS;
}

function reportReason(reason: string | undefined) {
  return reason?.trim() || "the staff-reviewed report";
}

export function buildReportDecisionMessage(options: {
  accepted: boolean;
  playerName: string;
  reason?: string;
}): InteractionResponseData {
  if (options.accepted) {
    return {
      embeds: [
        {
          title: "Report accepted. Good eye.",
          description: quoteList([
            `Your report on **${options.playerName}** checked out.`,
            `Staff marked it as **${reportReason(options.reason)}**.`,
            "Tiny victory lap: you made the server cleaner without making a whole thing out of it.",
          ]),
          color: 0x2ecc71,
          image: embedImage("report"),
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  return {
    embeds: [
      {
        title: "Report reviewed. No action this time.",
        description: quoteList([
          `Staff looked at your report on **${options.playerName}**.`,
          `Decision: **${reportReason(options.reason)}**.`,
          "No bad vibes. Keep sending clean proof when something feels off; good reports still help the team move faster.",
        ]),
        color: 0x8b96a3,
        image: embedImage("report"),
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export function buildReportBanMessage(options: {
  playerName: string;
  reason?: string;
  banSummary?: string;
}): InteractionResponseData {
  return {
    embeds: [
      {
        title: "Bullseye. They got banned.",
        description: quoteList([
          `The player you reported, **${options.playerName}**, is now banned in-game.`,
          `Your accepted report: **${reportReason(options.reason)}**.`,
          "That is the loop closing. Quiet hero work, honestly.",
          options.banSummary ? `Ban status: ${options.banSummary.split("\n")[0]}` : undefined,
        ]),
        color: EMBED_COLOR,
        image: embedImage("report"),
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export async function sendReportDecisionDm(
  env: Env,
  report: PendingReport,
  accepted: boolean
) {
  if (!discordBotToken(env)) {
    return;
  }

  await sendDiscordDm(
    env,
    report.reporterId,
    buildReportDecisionMessage({
      accepted,
      playerName: report.targetName,
      reason: report.publicReason,
    })
  );
}

export async function sendReportBanDm(
  env: Env,
  report: PlayerReport,
  banSummary?: string
) {
  if (!discordBotToken(env)) {
    return;
  }

  await sendDiscordDm(
    env,
    report.reporterId,
    buildReportBanMessage({
      playerName: report.playerName,
      reason: report.reason,
      banSummary,
    })
  );
}

export async function runBanWatcher(
  env: Env,
  now = new Date()
): Promise<BanWatcherResult> {
  const result: BanWatcherResult = {
    checked: 0,
    banned: 0,
    notified: 0,
    skipped: 0,
  };

  if (!env.USER_PREFERENCES || !discordBotToken(env)) {
    return result;
  }

  const reports = await listAcceptedReports(env);

  for (const report of reports) {
    if (report.banNotifiedAt || recentEnough(report.banLastCheckedAt, now)) {
      result.skipped += 1;
      continue;
    }

    if (result.checked >= MAX_BAN_WATCH_CHECKS_PER_RUN) {
      result.skipped += 1;
      continue;
    }

    result.checked += 1;

    try {
      const profile = await fetchProfileByPlayerOption(report.playerId);
      const checkedReport: PlayerReport = {
        ...report,
        playerName: profile ? displayName(profile) : report.playerName,
        banLastCheckedAt: now.toISOString(),
      };

      if (!profile || !hasActiveBan(profile.ban)) {
        await putAcceptedReport(env, checkedReport);
        continue;
      }

      result.banned += 1;
      const banSummary = formatBan(profile.ban);
      const detectedReport = {
        ...checkedReport,
        banDetectedAt: now.toISOString(),
      };

      try {
        await sendReportBanDm(env, detectedReport, banSummary);
        await putAcceptedReport(env, {
          ...detectedReport,
          banNotifiedAt: now.toISOString(),
        });
        result.notified += 1;
      } catch (dmError) {
        await putAcceptedReport(env, detectedReport);
        throw dmError;
      }
    } catch (error) {
      console.error("Ban watcher failed for accepted report", {
        reportId: report.reportId,
        playerId: report.playerId,
        reporterId: report.reporterId,
        error,
      });
    }
  }

  return result;
}
