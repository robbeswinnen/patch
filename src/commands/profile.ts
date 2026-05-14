import type { CommandModule, CommandRuntime, DiscordInteraction, Env } from "../types";
import {
  EPHEMERAL,
  PLAYER_OPTION,
  USER_INSTALLABLE_CONTEXTS,
  deferredInteractionResponse,
  editOriginalInteractionResponse,
  interactionResponse,
  optionValue,
  runInBackground,
} from "../lib/discord";
import {
  playerId,
  fetchProfileByPlayerOption,
} from "../lib/cops";
import {
  getOrRenderPlayerCard,
  getOrRenderPlayerCardFromProfile,
} from "../lib/profile-card-cache";
import { getAcceptedReport, getPlayerTagRecord } from "../lib/storage";
import { withCommandPromotion } from "../lib/promotions";
import { recordProfileLookup } from "../lib/lookup-counts";

export const definition = {
  name: "profile",
  description: "Generate a shareable player profile card.",
  type: 1,
  options: [
    {
      name: "player",
      ...PLAYER_OPTION,
    },
  ],
  ...USER_INSTALLABLE_CONTEXTS,
} as const;

type WaitUntil = CommandRuntime["waitUntil"];

async function editCard(
  interaction: DiscordInteraction,
  env: Env,
  card: Awaited<ReturnType<typeof getOrRenderPlayerCardFromProfile>>,
  report?: Awaited<ReturnType<typeof getAcceptedReport>>
) {
  await editOriginalInteractionResponse(
    env,
    interaction.token,
    withCommandPromotion(
      {
        attachments: [
          {
            id: 0,
            filename: card.filename,
            description: card.description,
          },
        ],
      },
      { commandName: "profile", env, interaction, report }
    ),
    {
      filename: card.filename,
      contentType: "image/png",
      body: card.body,
    }
  );
}

async function renderAndEditCard(
  interaction: DiscordInteraction,
  env: Env,
  player: string,
  waitUntil?: WaitUntil
) {
  try {
    const profile = await fetchProfileByPlayerOption(player);
    if (!profile) {
      const cachedCard = await getOrRenderPlayerCard(env, player, waitUntil);
      if (cachedCard) {
        await editCard(interaction, env, cachedCard);
        return;
      }

      await editOriginalInteractionResponse(env, interaction.token, {
        content: "I couldn't find that player. Check the spelling or ID and send me back in.",
        attachments: [],
      });
      return;
    }

    const targetPlayerId = playerId(profile);
    const [lookupCount, report, tagRecord] = await Promise.all([
      recordProfileLookup(env, profile),
      getAcceptedReport(env, targetPlayerId),
      getPlayerTagRecord(env, targetPlayerId),
    ]);
    const card = await getOrRenderPlayerCardFromProfile(
      env,
      player,
      profile,
      waitUntil,
      {
        report,
        tags: tagRecord?.tags || [],
        lookupCount,
      }
    );

    await editCard(interaction, env, card, report);
  } catch (error) {
    console.error(error);
    try {
      await editOriginalInteractionResponse(env, interaction.token, {
        content: "Profile cards are taking a slow lap right now. Give it a moment and try again.",
        attachments: [],
      });
    } catch (editError) {
      console.error(editError);
    }
  }
}

async function handle(
  interaction: DiscordInteraction,
  env: Env,
  runtime?: CommandRuntime
) {
  const player = optionValue(interaction.data?.options, "player");

  if (!player) {
    return interactionResponse({
      content: "Drop a player first: `/profile player:<name-or-id>`.",
      flags: EPHEMERAL,
    });
  }

  const waitUntil = runtime?.waitUntil?.bind(runtime);
  runInBackground(runtime, () => renderAndEditCard(interaction, env, player, waitUntil));

  return deferredInteractionResponse();
}

export const profileCommand: CommandModule = {
  definition,
  handle,
};
