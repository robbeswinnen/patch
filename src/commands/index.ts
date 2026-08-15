// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.
import { compareCommand } from './compare';
import { devCommand } from './dev';
import { helpCommand } from './help';
import { profileCommand } from './profile';
import { reportCommand } from './report';
import { statsCommand } from './stats';
import { trackCommand } from './track';
import { withPrivateResponseOption } from '../lib/discord';

const PUBLIC_COMMANDS = [profileCommand, reportCommand, statsCommand, trackCommand, helpCommand, compareCommand];
const COMMANDS = [...PUBLIC_COMMANDS, devCommand];
const PRIVATE_OPTION_COMMANDS = /* @__PURE__ */ new Set(['profile', 'stats', 'help', 'compare']);
const DISCORD_COMMANDS = [...PUBLIC_COMMANDS, devCommand].map((command) => {
	return PRIVATE_OPTION_COMMANDS.has(command.definition.name) ? withPrivateResponseOption(command.definition) : command.definition;
});

export { COMMANDS, DISCORD_COMMANDS };
