import { verifyKey } from "discord-interactions";
import type { CommandRuntime, DiscordInteraction, Env } from "./types";
import {
  APPLICATION_COMMAND,
  MESSAGE_COMPONENT,
  MODAL_SUBMIT,
  EPHEMERAL,
  interactionResponse,
  jsonResponse,
} from "./lib/discord";
import { runScheduledRankedUpdates } from "./lib/tracking";
import { warmPlayerCardRenderer } from "./lib/card-image";
import { runBanWatcher } from "./lib/ban-watcher";
import {
  COMMANDS,
  DISCORD_COMMANDS,
  buildClanEmbeds,
  buildCompareEmbed,
  buildStatsEmbeds,
  handleClanPage,
  handleReportReview,
  handleReportReviewModal,
  handleReportSubmitModal,
  handleStatsPage,
  handleTrackUnsubscribe,
} from "./commands";

export {
  DISCORD_COMMANDS,
  buildClanEmbeds,
  buildCompareEmbed,
  buildStatsEmbeds,
};
export type { Env };

async function handleComponent(interaction: DiscordInteraction, env: Env) {
  const customId = interaction.data?.custom_id || "";

  if (customId.startsWith("stats_page:")) {
    return handleStatsPage(interaction, env);
  }

  if (customId.startsWith("clan_page:")) {
    return handleClanPage(interaction);
  }

  if (customId.startsWith("track_unsub:")) {
    return handleTrackUnsubscribe(interaction, env);
  }

  if (customId.startsWith("report_accept:") || customId.startsWith("report_reject:")) {
    return handleReportReview(interaction, env);
  }

  return interactionResponse({
    content: "That menu is from an older message. Run the command again and I'll rebuild it fresh.",
    flags: EPHEMERAL,
  });
}

async function handleModalSubmit(
  interaction: DiscordInteraction,
  env: Env,
  runtime?: CommandRuntime
) {
  const customId = interaction.data?.custom_id || "";

  if (customId.startsWith("report_submit:")) {
    return handleReportSubmitModal(interaction, env, runtime);
  }

  if (customId.startsWith("report_review:")) {
    return handleReportReviewModal(interaction, env, runtime);
  }

  return interactionResponse({
    content: "That form is from an older Patch message. Run the command again and I’ll rebuild it fresh.",
    flags: EPHEMERAL,
  });
}

export async function handleInteraction(
  interaction: DiscordInteraction,
  env = {} as Env,
  runtime?: CommandRuntime
) {
  if (interaction.type === 1) {
    return jsonResponse({ type: 1 });
  }

  if (interaction.type === MESSAGE_COMPONENT) {
    return handleComponent(interaction, env);
  }

  if (interaction.type === MODAL_SUBMIT) {
    return handleModalSubmit(interaction, env, runtime);
  }

  if (interaction.type !== APPLICATION_COMMAND) {
    return jsonResponse({ error: "Unknown interaction" }, 400);
  }

  const commandName = interaction.data?.name;
  const command = COMMANDS.find((candidate) => candidate.definition.name === commandName);

  if (command) {
    return command.handle(interaction, env, runtime);
  }

  if (commandName === "cops") {
    return COMMANDS.find((candidate) => candidate.definition.name === "stats")!.handle(
      interaction,
      env,
      runtime
    );
  }

  return interactionResponse({
    content: "That command is not on Patch's board yet. Try `/help` for the menu.",
    flags: EPHEMERAL,
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("This Discord bot only accepts POST requests.", {
        status: 405,
      });
    }

    const signature = request.headers.get("x-signature-ed25519");
    const timestamp = request.headers.get("x-signature-timestamp");
    const body = await request.text();

    if (!signature || !timestamp) {
      return new Response("Missing Discord signature headers.", {
        status: 401,
      });
    }

    const isValidRequest = await verifyKey(
      body,
      signature,
      timestamp,
      env.DISCORD_PUBLIC_KEY
    );

    if (!isValidRequest) {
      return new Response("Invalid request signature.", {
        status: 401,
      });
    }

    let interaction: DiscordInteraction;
    try {
      interaction = JSON.parse(body) as DiscordInteraction;
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }

    return handleInteraction(interaction, env, ctx);
  },

  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      warmPlayerCardRenderer().catch((error) => {
        console.error("Failed to warm profile card renderer.", error);
      })
    );
    ctx.waitUntil(runScheduledRankedUpdates(env));
    ctx.waitUntil(runBanWatcher(env));
  },
} satisfies ExportedHandler<Env>;
