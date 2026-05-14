import type { CommandModule } from "../types";
import { helpCommand } from "./help";
import { profileCommand } from "./profile";
import { clanCommand, handleClanPage } from "./clan";
import { compareCommand } from "./compare";
import { devCommand } from "./dev";
import {
  reportCommand,
  handleReportReview,
  handleReportReviewModal,
  handleReportSubmitModal,
} from "./report";
import { statsCommand, handleStatsPage } from "./stats";
import { tagsCommand } from "./tags";
import { trackCommand, handleTrackUnsubscribe } from "./track";

export const PUBLIC_COMMANDS: CommandModule[] = [
  helpCommand,
  statsCommand,
  profileCommand,
  compareCommand,
  clanCommand,
  trackCommand,
  tagsCommand,
  reportCommand,
];

export const COMMANDS: CommandModule[] = [...PUBLIC_COMMANDS, devCommand];

export const DISCORD_COMMANDS = PUBLIC_COMMANDS.map((command) => command.definition);

export {
  handleClanPage,
  handleReportReview,
  handleReportReviewModal,
  handleReportSubmitModal,
  handleStatsPage,
  handleTrackUnsubscribe,
};

export { buildStatsEmbeds } from "./stats";
export { buildCompareEmbed } from "./compare";
export { buildClanEmbeds } from "./clan";
