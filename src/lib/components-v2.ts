// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.
import { EMBED_COLOR } from './cops';
import {
	BUTTON_SECONDARY,
	COMPONENT_CONTAINER,
	COMPONENT_MEDIA_GALLERY,
	COMPONENT_SECTION,
	COMPONENT_SEPARATOR,
	COMPONENT_TEXT_DISPLAY,
	IS_COMPONENTS_V2,
	actionRow,
	button,
	stringSelect,
} from './discord';

const UI_ACCENT = EMBED_COLOR;
const UI_ACCENT_SUCCESS = 3066993;
const UI_ACCENT_WARNING = 16753735;
const UI_ACCENT_DANGER = 16726832;
const UI_ACCENT_MUTED = 9148067;
const CUSTOM_ID_PREFIX = 'patch:v2';
function customId(...parts) {
	const sanitizedParts = parts.filter((part) => part !== undefined).map((part) => String(part).replace(/:/g, '_'));
	return [CUSTOM_ID_PREFIX, ...sanitizedParts].join(':').slice(0, 100);
}

function parseCustomId(value) {
	const parts = (value || '').split(':');
	if (parts[0] === 'patch' && parts[1] === 'v2') {
		return {
			scope: parts[2],
			action: parts[3],
			args: parts.slice(4),
		};
	}
	if (parts[0] === 'patch_v2') {
		return {
			scope: parts[1],
			action: parts[2],
			args: parts.slice(3),
		};
	}
	return undefined;
}

function textDisplay(content) {
	return {
		type: COMPONENT_TEXT_DISPLAY,
		content: content.slice(0, 4e3),
	};
}

function separator(divider = true, spacing = 1) {
	return {
		type: COMPONENT_SEPARATOR,
		divider,
		spacing,
	};
}

function mediaGallery(items) {
	return {
		type: COMPONENT_MEDIA_GALLERY,
		items: items.slice(0, 10).map((item) => ({
			media: {
				url: item.url,
			},
			description: item.description,
			spoiler: item.spoiler,
		})),
	};
}

function sectionWithAccessory(components, accessory) {
	return {
		type: COMPONENT_SECTION,
		components: components.slice(0, 3),
		accessory,
	};
}

function container(components, options = {}) {
	return {
		type: COMPONENT_CONTAINER,
		accent_color: options.accentColor ?? UI_ACCENT,
		spoiler: options.spoiler,
		components: components.slice(0, 40),
	};
}

function row(components) {
	return actionRow(components);
}

function primaryButton(customIdValue, label, disabled = false) {
	return button(customIdValue, label, BUTTON_SECONDARY, disabled);
}

function secondaryButton(customIdValue, label, disabled = false) {
	return button(customIdValue, label, BUTTON_SECONDARY, disabled);
}

function successButton(customIdValue, label, disabled = false) {
	return button(customIdValue, label, BUTTON_SECONDARY, disabled);
}

function dangerButton(customIdValue, label, disabled = false) {
	return button(customIdValue, label, BUTTON_SECONDARY, disabled);
}

function selectMenu(customIdValue, placeholder, options) {
	return stringSelect(customIdValue, placeholder, options.slice(0, 25));
}

function v2Message(components, flags = 0) {
	return {
		flags: flags | IS_COMPONENTS_V2,
		components,
		allowed_mentions: {
			parse: [],
		},
	};
}

function panel(title, body, options = {}) {
	const lines = body.filter((line) => Boolean(line));
	const children = [
		textDisplay(`### ${title}
${lines.join('\n')}`),
	];
	if (options.actions?.length) {
		children.push(separator(), ...options.actions);
	}
	return container(children, {
		accentColor: options.accentColor,
	});
}

function emptyStateContainer(title, message, actions = []) {
	return panel(title, [message], {
		accentColor: UI_ACCENT_WARNING,
		actions,
	});
}

function dashboardContainer(title, summary, sections, actions = []) {
	const children = [
		textDisplay(`## ${title}
${summary}`),
	];
	for (const section2 of sections) {
		const lines = section2.lines.filter((line) => Boolean(line));
		if (lines.length === 0) {
			continue;
		}
		children.push(
			separator(false),
			textDisplay(`**${section2.title}**
${lines.join('\n')}`),
		);
	}
	if (actions.length > 0) {
		children.push(separator(), ...actions);
	}
	return container(children);
}

function bulletList(lines) {
	return lines
		.filter((line) => Boolean(line))
		.map((line) => `- ${line}`)
		.join('\n');
}

function metricLine(label, value) {
	return `**${label}:** ${value ?? 'N/A'}`;
}

export {
	UI_ACCENT,
	UI_ACCENT_DANGER,
	UI_ACCENT_MUTED,
	UI_ACCENT_SUCCESS,
	UI_ACCENT_WARNING,
	bulletList,
	container,
	customId,
	dangerButton,
	dashboardContainer,
	emptyStateContainer,
	mediaGallery,
	metricLine,
	parseCustomId,
	primaryButton,
	row,
	secondaryButton,
	sectionWithAccessory,
	selectMenu,
	separator,
	successButton,
	textDisplay,
	v2Message,
};
