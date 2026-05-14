import type { CommandModule, DiscordInteraction, Env } from "../types";
import {
  USER_INSTALLABLE_CONTEXTS,
  interactionResponse,
} from "../lib/discord";
import { EMBED_COLOR } from "../lib/cops";
import { supportServerUrl } from "../lib/brand";
import { PLAYER_TAG_DEFINITIONS } from "../lib/player-tags";
import { embedImage, quoteList, section } from "../lib/presentation";
import { withCommandPromotion } from "../lib/promotions";

export const definition = {
  name: "tags",
  description: "Explain Patch account status tags.",
  type: 1,
  ...USER_INSTALLABLE_CONTEXTS,
} as const;

async function handle(interaction: DiscordInteraction, env: Env) {
  return interactionResponse(
    withCommandPromotion(
      {
        embeds: [
          {
            title: "Patch Account Tags",
            color: EMBED_COLOR,
            image: embedImage("tags"),
            description: [
              "## Profile tags",
              "Tags are small public labels that add context to `/stats` and `/profile` without turning the card into a notice board.",
              "",
              section(
                "Default states",
                quoteList([
                  "**Secure** - no accepted community report or curated tag.",
                  "**Community report** - staff accepted a proof-backed `/report` submission.",
                ])
              ),
              "",
              section(
                "Curated tags",
                quoteList(
                  PLAYER_TAG_DEFINITIONS.map(
                    (tag) => `**${tag.label}** - ${tag.description}`
                  )
                )
              ),
              "",
              section(
                "Apply",
                quoteList([
                  `Think you qualify for a tag? Join the support server and open a ticket: ${supportServerUrl(env)}`,
                  "Bring context. Patch likes clean receipts.",
                ])
              ),
            ].join("\n"),
          },
        ],
      },
      { commandName: "tags", env, interaction }
    )
  );
}

export const tagsCommand: CommandModule = {
  definition,
  handle,
};
