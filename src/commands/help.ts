// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.
import { helpDashboardMessage, simpleErrorMessage } from '../lib/app-ui';
import { parseCustomId } from '../lib/components-v2';
import { USER_INSTALLABLE_CONTEXTS, interactionResponse, updateMessageResponse } from '../lib/discord';

const helpDefinition = {
	name: 'help',
	description: 'Open the Patch app dashboard.',
	type: 1,
	...USER_INSTALLABLE_CONTEXTS,
};
async function helpMessage(interaction, env, sectionName = 'start') {
	return helpDashboardMessage({
		env,
		section: sectionName,
	});
}

async function handle(interaction, env) {
	return interactionResponse(await helpMessage(interaction, env));
}

async function handleHelpComponent(interaction, env) {
	const parsed = parseCustomId(interaction.data?.custom_id);
	const action = parsed?.action;
	if (action === 'section') {
		return updateMessageResponse(await helpMessage(interaction, env, interaction.data?.values?.[0] || 'start'));
	}
	return interactionResponse(simpleErrorMessage('Stale help control', 'That help control is no longer available. Run `/help` again.'));
}

const helpCommand = {
	definition: helpDefinition,
	handle,
};

export { handleHelpComponent, helpCommand };
