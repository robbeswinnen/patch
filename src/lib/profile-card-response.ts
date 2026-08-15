// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.
import { profileCardAttachmentMessage, profileCardContainerMessage } from './app-ui';
import { editOriginalInteractionResponse } from './discord';

function attachment(card) {
	return {
		id: 0,
		filename: card.filename,
		description: card.description,
	};
}

function cardFile(card) {
	return {
		filename: card.filename,
		contentType: 'image/png',
		body: card.body,
	};
}

async function sendProfileCardResponse(interaction, env, card, profile, options = {}) {
	const file = cardFile(card);
	const presentation = options.presentation || 'attachment';
	const payload =
		presentation === 'container'
			? profileCardContainerMessage({
					profile,
					attachmentUrl: `attachment://${card.filename}`,
				})
			: profileCardAttachmentMessage({ profile });
	const fullPayload = {
		...payload,
		attachments: [attachment(card)],
	};
	await editOriginalInteractionResponse(env, interaction.token, fullPayload, file);
}

export { sendProfileCardResponse };
