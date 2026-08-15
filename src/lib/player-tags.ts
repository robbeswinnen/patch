// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.

const PLAYER_TAG_IDS = ['verified', 'partner', 'developer', 'creator', 'competitive', 'organizer'];
const SECURE_STATUS_COLOR = '#11d1d6';
const REPORT_STATUS_COLOR = '#ff3b30';
const PLAYER_TAG_DEFINITIONS = [
	{
		id: 'verified',
		label: 'Verified',
		description: 'Known and trusted by the Patch team.',
		color: '#f6c945',
		embedColor: 16173381,
		icon: 'badge-check',
		priority: 10,
	},
	{
		id: 'partner',
		label: 'Partner',
		description: 'Official Patch partner.',
		color: '#38bdf8',
		embedColor: 3718648,
		icon: 'handshake',
		priority: 15,
	},
	{
		id: 'developer',
		label: 'Developer',
		description: 'Critical Ops developer.',
		color: '#c084fc',
		embedColor: 12616956,
		icon: 'code-2',
		priority: 20,
	},
	{
		id: 'creator',
		label: 'Creator',
		description: 'Content creator.',
		color: '#f472b6',
		embedColor: 16020150,
		icon: 'clapperboard',
		priority: 30,
	},
	{
		id: 'competitive',
		label: 'Competitive',
		description: 'Competitive player.',
		color: '#65d66e',
		embedColor: 6674030,
		icon: 'swords',
		priority: 40,
	},
	{
		id: 'organizer',
		label: 'Organizer',
		description: 'Hosts official tournaments or events.',
		color: '#f59e0b',
		embedColor: 16096779,
		icon: 'calendar-days',
		priority: 50,
	},
];
const PLAYER_TAG_BY_ID = Object.fromEntries(PLAYER_TAG_DEFINITIONS.map((tag) => [tag.id, tag]));
function parsePlayerTagId(value) {
	return PLAYER_TAG_IDS.find((tagId) => tagId === value);
}

function normalizePlayerTagIds(tags) {
	const unique = /* @__PURE__ */ new Set();
	for (const tag of tags || []) {
		const tagId = parsePlayerTagId(tag);
		if (tagId) {
			unique.add(tagId);
		}
	}
	return Array.from(unique).sort((a, b) => PLAYER_TAG_BY_ID[a].priority - PLAYER_TAG_BY_ID[b].priority);
}

function playerTagDefinitions(tags) {
	return normalizePlayerTagIds(tags).map((tagId) => PLAYER_TAG_BY_ID[tagId]);
}

function publicStatusFor(report, tags) {
	if (report) {
		return {
			kind: 'report',
			label: 'Community report',
			reportReason: report.reason,
			color: REPORT_STATUS_COLOR,
			embedColor: 16726832,
			icon: 'shield-alert',
		};
	}
	const definitions = playerTagDefinitions(tags);
	if (definitions.length > 0) {
		const primary = definitions[0];
		return {
			kind: 'tags',
			label: definitions.map((tag) => tag.label).join(', '),
			tags: definitions,
			color: primary.color,
			embedColor: primary.embedColor,
			icon: primary.icon,
		};
	}
	return {
		kind: 'secure',
		label: 'Secure',
		color: SECURE_STATUS_COLOR,
		embedColor: 1167830,
		icon: 'shield-check',
	};
}

export { PLAYER_TAG_BY_ID, PLAYER_TAG_DEFINITIONS, normalizePlayerTagIds, parsePlayerTagId, publicStatusFor };
