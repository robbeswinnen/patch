import type {
  CommandModule,
  CommandRuntime,
  DiscordAttachment,
  DiscordEmbed,
  DiscordInteraction,
  Env,
} from "../types";
import {
  APPLICATION_COMMAND_OPTION_ATTACHMENT,
  BUTTON_DANGER,
  BUTTON_SUCCESS,
  EPHEMERAL,
  PLAYER_OPTION,
  TEXT_INPUT_PARAGRAPH,
  TEXT_INPUT_SHORT,
  USER_INSTALLABLE_CONTEXTS,
  actionRow,
  button,
  deferredInteractionResponse,
  discordBotToken,
  editOriginalInteractionResponse,
  interactionResponse,
  interactionUserId,
  labelComponent,
  modalResponse,
  modalValue,
  optionAttachment,
  optionValue,
  runInBackground,
  sendDiscordMessage,
  textInput,
  updateMessageResponse,
} from "../lib/discord";
import {
  type CriticalOpsProfile,
  EMBED_COLOR,
  displayName,
  fetchProfileByPlayerOption,
  fieldValue,
  formatOptionalInteger,
  formatStats,
  latestSeason,
  playerId,
  rankName,
} from "../lib/cops";
import {
  type PendingReport,
  type ReportDraft,
  type ReportProof,
  acceptReport,
  createPendingReport,
  createReportDraft,
  deleteReportDraft,
  getPendingReport,
  getReportBlacklistEntry,
  getReportCooldown,
  getReportDraft,
  putReportCooldown,
  rejectReport,
} from "../lib/storage";
import { clearPlayerCardLookupCaches } from "../lib/profile-card-cache";
import { embedImage, quoteLines, quoteList } from "../lib/presentation";
import { sendReportDecisionDm } from "../lib/ban-watcher";
import { withCommandPromotion } from "../lib/promotions";
import { recordProfileLookupSoon } from "../lib/lookup-counts";

const REPORT_COOLDOWN_SECONDS = 10 * 60;

export const definition = {
  name: "report",
  description: "Send a player report to Patch staff for review.",
  type: 1,
  options: [
    {
      name: "player",
      ...PLAYER_OPTION,
    },
    {
      name: "proof",
      description: "Image or video proof staff can review.",
      type: APPLICATION_COMMAND_OPTION_ATTACHMENT,
      required: true,
    },
  ],
  ...USER_INSTALLABLE_CONTEXTS,
} as const;

type ReportView = {
  id: string;
  reporterId: string;
  targetName: string;
  targetPlayerId: string;
  reason: string;
  details?: string;
  proof?: ReportProof;
  publicReason?: string;
  reviewerNote?: string;
  status: string;
  createdAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
};

function proofFromAttachment(attachment: DiscordAttachment): ReportProof | undefined {
  if (!attachment.url) {
    return undefined;
  }

  return {
    url: attachment.url,
    filename: attachment.filename,
    contentType: attachment.content_type,
    size: attachment.size,
  };
}

function isProofAttachment(attachment: DiscordAttachment | undefined) {
  if (!attachment?.url) {
    return false;
  }

  const contentType = attachment.content_type || "";
  if (contentType.startsWith("image/") || contentType.startsWith("video/")) {
    return true;
  }

  return /\.(png|jpe?g|gif|webp|mp4|mov|m4v|webm)$/i.test(
    attachment.filename || attachment.url
  );
}

function cleanModalText(value: string | undefined, fallback = "") {
  return (value || fallback).replace(/\s+/g, " ").trim();
}

function cleanParagraph(value: string | undefined) {
  return (value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function linkText(value: string | undefined) {
  return (value || "proof")
    .replace(/[[\]()]/g, "")
    .slice(0, 80);
}

function proofLine(proof: ReportProof | undefined) {
  if (!proof?.url) {
    return "Proof: not attached";
  }

  const label = linkText(proof.filename);
  const type = proof.contentType ? ` (${proof.contentType})` : "";
  return `Proof: [${label}](${proof.url})${type}`;
}

function cooldownMessage(retryAt: string) {
  const retrySeconds = Math.floor(Date.parse(retryAt) / 1000);
  return `Easy there, report cannon. Let staff chew through the last one first, then try again <t:${retrySeconds}:R>.`;
}

function reportSubmitModal(draftId: string) {
  return modalResponse({
    custom_id: `report_submit:${draftId}`,
    title: "Report context",
    components: [
      labelComponent(
        "Short reason",
        textInput("report_reason", TEXT_INPUT_SHORT, {
          minLength: 3,
          maxLength: 80,
        }),
        "Example: cheating, griefing, boosting, throwing"
      ),
      labelComponent(
        "What happened?",
        textInput("report_details", TEXT_INPUT_PARAGRAPH, {
          minLength: 20,
          maxLength: 1000,
        }),
        "Keep it specific. Staff gets proof plus this note."
      ),
    ],
  });
}

function reportReviewModal(reportId: string, action: "accept" | "reject") {
  const approving = action === "accept";
  return modalResponse({
    custom_id: `report_review:${action}:${reportId}`,
    title: approving ? "Approve report" : "Decline report",
    components: [
      labelComponent(
        approving ? "Public reason" : "Decision reason",
        textInput("report_public_reason", TEXT_INPUT_SHORT, {
          minLength: 3,
          maxLength: 80,
        }),
        approving
          ? "This is what future /stats and /profile output will show."
          : "Short decision label for the staff queue."
      ),
      labelComponent(
        "Reviewer note",
        textInput("report_reviewer_note", TEXT_INPUT_PARAGRAPH, {
          minLength: 8,
          maxLength: 1000,
        }),
        "What convinced you? This stays on the reviewed staff embed."
      ),
    ],
  });
}

function reportButtons(reportId: string, disabled = false) {
  return [
    actionRow([
      button(`report_accept:${reportId}`, "Approve report", BUTTON_SUCCESS, disabled),
      button(`report_reject:${reportId}`, "Decline report", BUTTON_DANGER, disabled),
    ]),
  ];
}

function reportStatusLabel(status: string) {
  if (status === "accepted") return "Accepted";
  if (status === "rejected") return "Declined";
  return "Pending review";
}

function reportStatusColor(status: string) {
  if (status === "accepted") return 0x2ecc71;
  if (status === "rejected") return 0xff3b30;
  return EMBED_COLOR;
}

function reportReviewDescription(report: ReportView) {
  const lines = [
    `## Community review: ${report.targetName}`,
    ``,
    `A player report landed in the staff queue. Keep it fair, specific, and useful.`,
    ``,
    `**Report details**`,
    quoteList([
      `Status: **${reportStatusLabel(report.status)}**`,
      `Player: **${report.targetName}**`,
      `Player ID: \`${report.targetPlayerId}\``,
      `Reporter: <@${report.reporterId}>`,
      proofLine(report.proof),
    ]),
    ``,
    `**Reporter summary**`,
    quoteList([report.reason]),
    ``,
    `**What happened**`,
    quoteLines((report.details || "No extra details were submitted.").split("\n")),
  ];

  if (report.publicReason || report.reviewerNote) {
    lines.push(
      ``,
      `**Review outcome**`,
      quoteList([
        report.publicReason ? `Reason: **${report.publicReason}**` : undefined,
        report.reviewedBy ? `Reviewer: <@${report.reviewedBy}>` : undefined,
        report.reviewedAt ? `Reviewed: <t:${Math.floor(Date.parse(report.reviewedAt) / 1000)}:R>` : undefined,
      ]),
      ``,
      `**Reviewer note**`,
      quoteLines((report.reviewerNote || "No reviewer note was added.").split("\n"))
    );
  } else {
    lines.push(
      ``,
      `**Staff note**`,
      quoteList([
        "Approve only when the proof and explanation are strong enough to help the community.",
        "Decline fast when the report is vague, personal, or missing context.",
      ])
    );
  }

  return fieldValue(lines.join("\n"));
}

function reportReviewEmbed(report: ReportView): DiscordEmbed {
  return {
    title: `Patch Report: ${report.targetName}`,
    description: reportReviewDescription(report),
    color: reportStatusColor(report.status),
    image: embedImage("report"),
    timestamp: report.createdAt || new Date().toISOString(),
  };
}

function reportReviewEmbedWithProfileContext(
  report: ReportView,
  profile: CriticalOpsProfile
): DiscordEmbed {
  const rankedStats = latestSeason(profile)?.ranked;

  return {
    ...reportReviewEmbed(report),
    fields: [
      {
        name: "Current ranked context",
        value: fieldValue(quoteList([
          `Rank: ${rankName(profile.stats?.ranked)}`,
          `MMR: ${formatOptionalInteger(profile.stats?.ranked?.mmr)}`,
          ...formatStats(rankedStats).split("\n"),
        ])),
        inline: false,
      },
    ],
  };
}

export async function handleReportReview(
  interaction: DiscordInteraction,
  env: Env
) {
  const customId = interaction.data?.custom_id || "";
  const reportId = customId.replace(/^report_(accept|reject):/, "");

  try {
    const report = await getPendingReport(env, reportId);

    if (!report) {
      return interactionResponse({
        content: "That report is not in the queue anymore. Someone may have already handled it.",
        flags: EPHEMERAL,
      });
    }

    return reportReviewModal(
      reportId,
      customId.startsWith("report_accept:") ? "accept" : "reject"
    );
  } catch (error) {
    console.error("Failed to open report review modal", {
      reportId,
      error,
    });

    return interactionResponse({
      content: "The review form is not opening right now. Give it a moment and try again.",
      flags: EPHEMERAL,
    });
  }
}

export async function handleReportReviewModal(
  interaction: DiscordInteraction,
  env: Env,
  runtime?: CommandRuntime
) {
  const customId = interaction.data?.custom_id || "";
  const [, action, reportId] = customId.match(/^report_review:(accept|reject):(.+)$/) || [];
  const reviewerId = interactionUserId(interaction) || "unknown";
  const publicReason = cleanModalText(modalValue(interaction, "report_public_reason"));
  const reviewerNote = cleanParagraph(modalValue(interaction, "report_reviewer_note"));

  if (!reportId || (action !== "accept" && action !== "reject")) {
    return interactionResponse({
      content: "That review form came back scrambled. Open the report again and try once more.",
      flags: EPHEMERAL,
    });
  }

  if (!publicReason || !reviewerNote) {
    return interactionResponse({
      content: "Give staff the short reason and the note. Future-you will appreciate the receipts.",
      flags: EPHEMERAL,
    });
  }

  try {
    const report = await getPendingReport(env, reportId);

    if (!report) {
      return interactionResponse({
        content: "That report is not in the queue anymore. Someone may have already handled it.",
        flags: EPHEMERAL,
      });
    }

    const reviewed =
      action === "accept"
        ? await acceptReport(env, report, reviewerId, publicReason, reviewerNote)
        : await rejectReport(env, report, reviewerId, publicReason, reviewerNote);

    if (action === "accept") {
      await clearPlayerCardLookupCaches(env, [
        report.targetPlayerId,
        report.targetName,
      ]);
    }

    if (runtime?.waitUntil) {
      runtime.waitUntil(
        sendReportDecisionDm(env, reviewed, action === "accept").catch((error) => {
          console.error("Failed to DM report review outcome", {
            reportId,
            reporterId: reviewed.reporterId,
            error,
          });
        })
      );
    }

    return updateMessageResponse({
      embeds: [reportReviewEmbed(reviewed)],
      components: reportButtons(reportId, true),
    });
  } catch (error) {
    console.error("Failed to review report", {
      reportId,
      reviewerId,
      error,
    });

    return interactionResponse({
      content: "The review form is not saving right now. Give it a moment and try again.",
      flags: EPHEMERAL,
    });
  }
}

async function editReportSubmitResponse(
  interaction: DiscordInteraction,
  env: Env,
  draft: ReportDraft,
  reason: string,
  details: string,
  supportReportChannelId: string,
  waitUntil?: CommandRuntime["waitUntil"]
) {
  try {
    const profile = await fetchProfileByPlayerOption(draft.player);

    if (!profile || !playerId(profile)) {
      await editOriginalInteractionResponse(env, interaction.token, {
        content: "I couldn't find that player. Check the spelling or ID and send the report again.",
      });
      return;
    }

    recordProfileLookupSoon(env, profile, waitUntil);

    const targetPlayerId = playerId(profile);

    if (!targetPlayerId) {
      await editOriginalInteractionResponse(env, interaction.token, {
        content: "I found the player, but their ID did not come through cleanly. Try once more with the player ID.",
      });
      return;
    }

    const report = await createPendingReport(env, {
      id: crypto.randomUUID(),
      reporterId: draft.reporterId,
      targetPlayerId,
      targetName: displayName(profile),
      reason,
      details,
      proof: draft.proof,
    });

    const embed = reportReviewEmbedWithProfileContext(report, profile);

    try {
      await sendDiscordMessage(env, supportReportChannelId, {
        embeds: [embed],
        components: reportButtons(report.id),
      });
    } catch (sendError) {
      console.error("Failed to send report to support channel", {
        supportReportChannelId,
        reportId: report.id,
        reporterId: draft.reporterId,
        targetPlayerId: report.targetPlayerId,
        error: sendError,
      });

      await editOriginalInteractionResponse(env, interaction.token, {
        content:
          "I saved the report, but the staff channel did not accept the message. The bot owner should check the channel ID and permissions.",
      });
      return;
    }

    await Promise.all([
      putReportCooldown(env, draft.reporterId, REPORT_COOLDOWN_SECONDS),
      deleteReportDraft(env, draft.id),
    ]);

    await editOriginalInteractionResponse(
      env,
      interaction.token,
      withCommandPromotion(
        {
          content: "Report landed with staff. Thanks for looking out for the community.",
        },
        { commandName: "report", env, interaction }
      )
    );
  } catch (error) {
    console.error("Failed to submit report", {
      reporterId: draft.reporterId,
      player: draft.player,
      error,
    });

    await editOriginalInteractionResponse(env, interaction.token, {
      content: "The report desk is not taking new notes right now. Give it a bit and try again.",
    });
  }
}

export async function handleReportSubmitModal(
  interaction: DiscordInteraction,
  env: Env,
  runtime?: CommandRuntime
) {
  const draftId = (interaction.data?.custom_id || "").replace("report_submit:", "");
  const reporterId = interactionUserId(interaction);
  const reason = cleanModalText(modalValue(interaction, "report_reason"));
  const details = cleanParagraph(modalValue(interaction, "report_details"));
  const supportReportChannelId = env.SUPPORT_REPORT_CHANNEL_ID?.trim();

  if (!reporterId) {
    return interactionResponse({
      content: "I can't tell who is sending this report. Try again from your own Discord account.",
      flags: EPHEMERAL,
    });
  }

  if (!reason || !details) {
    return interactionResponse({
      content: "Give staff the short reason and what happened. Blank reports go straight into the void.",
      flags: EPHEMERAL,
    });
  }

  if (!env.USER_PREFERENCES || !discordBotToken(env) || !supportReportChannelId) {
    return interactionResponse({
      content: "Reports need storage, a bot token, and a staff channel before they can land anywhere useful.",
      flags: EPHEMERAL,
    });
  }

  const draft = await getReportDraft(env, draftId);
  if (!draft || draft.reporterId !== reporterId) {
    return interactionResponse({
      content: "That report form expired. Run `/report` again and I’ll hand you a fresh one.",
      flags: EPHEMERAL,
    });
  }

  const blacklist = await getReportBlacklistEntry(env, reporterId);
  if (blacklist) {
    return interactionResponse({
      content: "Your report button is taking a staff-enforced nap. Ask the team if you think that changed.",
      flags: EPHEMERAL,
    });
  }

  const cooldown = await getReportCooldown(env, reporterId);
  if (cooldown) {
    return interactionResponse({
      content: cooldownMessage(cooldown.retryAt),
      flags: EPHEMERAL,
    });
  }

  runInBackground(runtime, () =>
    editReportSubmitResponse(
      interaction,
      env,
      draft,
      reason,
      details,
      supportReportChannelId,
      runtime?.waitUntil?.bind(runtime)
    )
  );
  return deferredInteractionResponse({ flags: EPHEMERAL });
}

async function handle(
  interaction: DiscordInteraction,
  env: Env
) {
  const reporterId = interactionUserId(interaction);
  const player = optionValue(interaction.data?.options, "player");
  const proofAttachment = optionAttachment(interaction, "proof");
  const proof = proofAttachment ? proofFromAttachment(proofAttachment) : undefined;
  const supportReportChannelId = env.SUPPORT_REPORT_CHANNEL_ID?.trim();

  if (!reporterId) {
    return interactionResponse({
      content: "I can't tell who is sending this report. Try again from your own Discord account.",
      flags: EPHEMERAL,
    });
  }

  if (!player || !proofAttachment) {
    return interactionResponse({
      content: "Give staff a player and proof: `/report player:<name-or-id> proof:<image-or-video>`.",
      flags: EPHEMERAL,
    });
  }

  if (!isProofAttachment(proofAttachment) || !proof) {
    return interactionResponse({
      content: "Proof needs to be an image or video. Screenshots, clips, the good stuff.",
      flags: EPHEMERAL,
    });
  }

  if (!env.USER_PREFERENCES) {
    return interactionResponse({
      content: "Reports need storage before staff can review them. Ask the bot owner to hook up KV.",
      flags: EPHEMERAL,
    });
  }

  if (!discordBotToken(env)) {
    return interactionResponse({
      content: "Reports need the bot token before they can reach staff. Bot owner setup time.",
      flags: EPHEMERAL,
    });
  }

  if (!supportReportChannelId) {
    return interactionResponse({
      content: "Reports need a staff channel before they can land anywhere useful.",
      flags: EPHEMERAL,
    });
  }

  const blacklist = await getReportBlacklistEntry(env, reporterId);
  if (blacklist) {
    return interactionResponse({
      content: "Your report button is taking a staff-enforced nap. Ask the team if you think that changed.",
      flags: EPHEMERAL,
    });
  }

  const cooldown = await getReportCooldown(env, reporterId);
  if (cooldown) {
    return interactionResponse({
      content: cooldownMessage(cooldown.retryAt),
      flags: EPHEMERAL,
    });
  }

  const draft = await createReportDraft(env, {
    id: crypto.randomUUID(),
    reporterId,
    player,
    proof,
  });

  return reportSubmitModal(draft.id);
}

export const reportCommand: CommandModule = {
  definition,
  handle,
};
