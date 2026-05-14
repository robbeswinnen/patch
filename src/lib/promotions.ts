import type {
  DiscordEmbed,
  DiscordInteraction,
  Env,
  InteractionResponseData,
} from "../types";
import type { PlayerReport } from "./cops";
import { supportServerUrl } from "./brand";

const LOW_PROMOTION_CHANCE = 0.02;
const REPORT_APPEAL_PROMOTION_CHANCE = 0.52;
const PROMOTION_COLOR = 0x202b36;

type PromotionContext = {
  commandName: string;
  env: Env;
  interaction: DiscordInteraction;
  report?: PlayerReport;
};

function rollFromInteraction(interaction: DiscordInteraction, salt: string) {
  const seed = `${interaction.id || ""}:${interaction.user?.id || interaction.member?.user?.id || ""}:${salt}`;
  if (!interaction.id) {
    return 1;
  }

  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) / 0xffffffff;
}

function profileTip(): DiscordEmbed {
  return {
    title: "Tiny Patch tip",
    description: "The main trick is still `/profile player:<name-or-id>`: clean card, easy share, no spreadsheet energy.",
    color: PROMOTION_COLOR,
  };
}

function profileCommandTip(env: Env, interaction: DiscordInteraction): DiscordEmbed {
  if (rollFromInteraction(interaction, "profile-tip-kind") < 0.5) {
    return {
      title: "Tiny Patch tip",
      description: "Want the numbers behind the card? `/stats player:<name-or-id>` opens the deeper read.",
      color: PROMOTION_COLOR,
    };
  }

  return {
    title: "Tiny Patch tip",
    description: `Need staff, appeals, or humans with context? The support server is here: ${supportServerUrl(env)}`,
    color: PROMOTION_COLOR,
  };
}

function reportAppealTip(env: Env): DiscordEmbed {
  return {
    title: "Appeal route",
    description: `If this is your account and the community report needs another look, create a ticket in the support server: ${supportServerUrl(env)}`,
    color: 0xffa447,
  };
}

export function commandPromotionEmbed({
  commandName,
  env,
  interaction,
  report,
}: PromotionContext): DiscordEmbed | undefined {
  if (
    report &&
    rollFromInteraction(interaction, `report-appeal:${report.reportId}`) <
      REPORT_APPEAL_PROMOTION_CHANCE
  ) {
    return reportAppealTip(env);
  }

  if (rollFromInteraction(interaction, `low-promo:${commandName}`) >= LOW_PROMOTION_CHANCE) {
    return undefined;
  }

  return commandName === "profile"
    ? profileCommandTip(env, interaction)
    : profileTip();
}

export function withCommandPromotion(
  data: InteractionResponseData,
  context: PromotionContext
): InteractionResponseData {
  const promotion = commandPromotionEmbed(context);
  if (!promotion) {
    return data;
  }

  return {
    ...data,
    embeds: [...(data.embeds || []), promotion],
  };
}
