// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.
import { supportServerUrl } from './brand';
import {
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
	primaryButton,
	row,
	secondaryButton,
	sectionWithAccessory,
	selectMenu,
	separator,
	successButton,
	textDisplay,
	v2Message,
} from './components-v2';
import {
	accountCreatedEstimate,
	currentSeason,
	displayName,
	fieldValue,
	formatBan,
	formatClanMembership,
	formatLastOnline,
	formatOptionalInteger,
	formatRank,
	formatStats,
	latestSeason,
	peakRankName,
	playerId,
	rankName,
	seasonByNumber,
	statField,
	sumStats,
} from './cops';
import { embedImage } from './presentation';
import { trackingChangeLines } from './tracking';

const PROFILE_VIEW_OPTIONS = [
	{ label: 'Overview', value: 'overview', description: 'Profile card and current read.' },
	{ label: 'Ranked', value: 'ranked', description: 'Rank, MMR, and current season.' },
	{ label: 'Clan', value: 'clan', description: 'Clan membership from player data.' },
	{ label: 'History', value: 'history', description: 'Public season totals.' },
	{ label: 'Actions', value: 'actions', description: 'Track, compare, and report shortcuts.' },
];
const STATS_VIEW_OPTIONS = [
	{ label: 'Overview', value: 'overview', description: 'Identity, status, and rank.' },
	{ label: 'Ranked', value: 'ranked', description: 'Current ranked shape.' },
	{ label: 'Performance', value: 'performance', description: 'Mode-by-mode current season.' },
	{ label: 'History', value: 'history', description: 'Public all-time totals.' },
	{ label: 'Metadata', value: 'metadata', description: 'Account and public data notes.' },
];
const HELP_SECTIONS = [
	{ label: 'Settings', value: 'start', description: 'Patch controls and defaults.' },
	{ label: 'Private output', value: 'privacy', description: 'Keep supported replies ephemeral.' },
	{ label: 'Tracking', value: 'tracking', description: 'Dashboard, changes, and removals.' },
	{ label: 'Reports', value: 'reporting', description: 'Proof-backed staff review.' },
	{ label: 'Compare', value: 'compare', description: 'Readable matchup boards.' },
	{ label: 'Support', value: 'about', description: 'Server and app info.' },
];
function profileKey(profile) {
	return playerId(profile) || encodeURIComponent(displayName(profile)).slice(0, 40);
}

function timestamp(isoDate, style = 'R') {
	const value = isoDate ? Date.parse(isoDate) : NaN;
	if (!Number.isFinite(value)) {
		return 'Never';
	}
	return `<t:${Math.floor(value / 1e3)}:${style}>`;
}

function latestSeasonNumber(profile) {
	return currentSeason(profile.stats?.seasonal_stats || []);
}

function profileActions(profile) {
	const key = profileKey(profile);
	return [
		row([
			primaryButton(customId('profile', 'stats', key), 'Stats'),
			successButton(customId('profile', 'track', key), 'Track'),
			secondaryButton(customId('profile', 'compare', key), 'Compare'),
			dangerButton(customId('profile', 'report', key), 'Report'),
			secondaryButton(customId('profile', 'refresh', key), 'Refresh'),
		]),
	];
}

function playerNavigation(profile, selected, source) {
	return row([
		selectMenu(
			customId(source, 'view', profileKey(profile)),
			source === 'profile' ? 'Profile sections' : 'Stats sections',
			(source === 'profile' ? PROFILE_VIEW_OPTIONS : STATS_VIEW_OPTIONS).map((option) => ({
				...option,
				default: option.value === selected,
			})),
		),
	]);
}

function statusLine(report, tagRecord) {
	if (report) {
		return `Community report accepted: **${report.reason}**`;
	}
	if (tagRecord?.tags.length) {
		return `Curated tags: **${tagRecord.tags.join(', ')}**`;
	}
	return 'Community status: **Secure**';
}

function peakRankMetric(profile) {
	return peakRankName(profile.stats?.ranked) || 'Unknown';
}

function profileCardAttachmentMessage(options) {
	return {
		allowed_mentions: {
			parse: [],
		},
	};
}

function profileCardContainerMessage(options) {
	return v2Message([
		container([
			mediaGallery([
				{
					url: options.attachmentUrl,
					description: `${displayName(options.profile)} profile card`,
				},
			]),
			separator(false),
			...profileActions(options.profile),
		]),
	]);
}

function statsDashboardMessage(options) {
	const { profile, report, tagRecord } = options;
	const view = options.view || 'overview';
	const key = profileKey(profile);
	const seasonNumber = latestSeasonNumber(profile);
	const season = seasonByNumber(profile.stats?.seasonal_stats || [], seasonNumber);
	const ranked = profile.stats?.ranked;
	const lastOnline = formatLastOnline(profile);
	const children = [
		textDisplay(
			[
				`## ${displayName(profile)} stats`,
				`${statusLine(report, tagRecord)}`,
				bulletList([
					metricLine('Player ID', playerId(profile) ? `\`${playerId(profile)}\`` : 'Unknown'),
					lastOnline ? metricLine('Last online', lastOnline) : undefined,
					metricLine('Selected view', view),
					metricLine('Season', seasonNumber ?? 'Unknown'),
				]),
			].join('\n'),
		),
	];
	if (view === 'overview') {
		children.push(
			separator(),
			textDisplay(
				[
					'**Overview**',
					bulletList([
						metricLine('Rank', rankName(ranked)),
						metricLine('Peak', peakRankMetric(profile)),
						metricLine('MMR', formatOptionalInteger(ranked?.mmr)),
						metricLine('Clan', formatClanMembership(profile).replace(/\n/g, ' - ')),
						accountCreatedEstimate(profile.stats?.seasonal_stats || []),
					]),
				].join('\n'),
			),
		);
	}
	if (view === 'ranked') {
		children.push(
			separator(),
			textDisplay(`**Ranked**
${bulletList([...formatRank(ranked).split('\n'), ...formatStats(season?.ranked).split('\n')])}`),
		);
	}
	if (view === 'performance') {
		children.push(
			separator(),
			textDisplay(
				[
					'**Performance**',
					bulletList([
						`Ranked: ${fieldValue(statField('Ranked', season?.ranked).value)}`,
						`Casual: ${fieldValue(statField('Casual', season?.casual).value)}`,
						`Custom: ${fieldValue(statField('Custom', season?.custom).value)}`,
					]),
				].join('\n'),
			),
		);
	}
	if (view === 'history') {
		children.push(
			separator(),
			textDisplay(
				[
					'**Historical public totals**',
					bulletList([
						`Ranked: ${fieldValue(statField('Ranked', sumStats(profile.stats?.seasonal_stats || [], 'ranked')).value)}`,
						`Casual: ${fieldValue(statField('Casual', sumStats(profile.stats?.seasonal_stats || [], 'casual')).value)}`,
						`Custom: ${fieldValue(statField('Custom', sumStats(profile.stats?.seasonal_stats || [], 'custom')).value)}`,
					]),
				].join('\n'),
			),
		);
	}
	if (view === 'metadata') {
		children.push(
			separator(),
			textDisplay(
				[
					'**Metadata**',
					bulletList([
						...formatBan(profile.ban).split('\n'),
						`Profile data source: Critical Ops public profile API`,
						`Snapshot generated: <t:${Math.floor(Date.now() / 1e3)}:R>`,
					]),
				].join('\n'),
			),
		);
	}
	children.push(
		separator(),
		playerNavigation(profile, view, 'stats'),
		row([
			primaryButton(customId('stats', 'profile', key), 'View Profile'),
			secondaryButton(customId('stats', 'compare', key), 'Compare'),
			successButton(customId('stats', 'track', key), 'Track'),
			dangerButton(customId('stats', 'report', key), 'Report'),
		]),
	);
	return v2Message([
		container(children, {
			accentColor: report ? UI_ACCENT_DANGER : UI_ACCENT,
		}),
	]);
}

function compareMessage(playerA, playerB) {
	const aName = displayName(playerA);
	const bName = displayName(playerB);
	const aRanked = latestSeason(playerA)?.ranked;
	const bRanked = latestSeason(playerB)?.ranked;
	const keyA = profileKey(playerA);
	const keyB = profileKey(playerB);
	const aLastOnline = formatLastOnline(playerA);
	const bLastOnline = formatLastOnline(playerB);
	return v2Message([
		container([
			textDisplay(
				[
					`## ${aName} vs ${bName}`,
					'Current-season comparison from public ranked data.',
					bulletList([
						`${aName}: **${rankName(playerA.stats?.ranked)}**, ${formatOptionalInteger(playerA.stats?.ranked?.mmr)} MMR`,
						aLastOnline ? `${aName} last online: ${aLastOnline}` : undefined,
						`${aName} peak: **${peakRankMetric(playerA)}**`,
						`${bName}: **${rankName(playerB.stats?.ranked)}**, ${formatOptionalInteger(playerB.stats?.ranked?.mmr)} MMR`,
						bLastOnline ? `${bName} last online: ${bLastOnline}` : undefined,
						`${bName} peak: **${peakRankMetric(playerB)}**`,
					]),
				].join('\n'),
			),
			separator(),
			textDisplay(`**${aName} ranked**
${bulletList(formatStats(aRanked).split('\n'))}`),
			textDisplay(`**${bName} ranked**
${bulletList(formatStats(bRanked).split('\n'))}`),
			separator(),
			row([
				primaryButton(customId('stats', 'profile', keyA), `${aName.slice(0, 24)} profile`),
				primaryButton(customId('stats', 'profile', keyB), `${bName.slice(0, 24)} profile`),
				secondaryButton(customId('profile', 'compare', keyA), 'New Compare'),
			]),
		]),
	]);
}

function trackingDashboardMessage(options) {
	const { record } = options;
	const filter = options.filter || 'all';
	const ephemeral = options.ephemeral ?? true;
	const changes = options.changes
		.filter((change) => filter === 'all' || change.changed)
		.sort((a, b) => b.movementScore - a.movementScore || a.player.label.localeCompare(b.player.label));
	const changedCount = options.changes.filter((change) => change.changed).length;
	if (record.players.length === 0) {
		return v2Message(
			[
				emptyStateContainer(
					'Tracking dashboard',
					'No tracked players yet. Add a player with `/track player:<name-or-id>` or from a profile hub.',
					[row([primaryButton(customId('track', 'add'), 'Add Player')])],
				),
			],
			ephemeral ? 64 : 0,
		);
	}
	const playerSections = changes
		.slice(0, 25)
		.map((change) =>
			sectionWithAccessory(
				[textDisplay([`**${change.player.label}**`, bulletList(trackingChangeLines(change))].join('\n'))],
				dangerButton(customId('track', 'remove', change.player.key), 'Remove'),
			),
		);
	return v2Message(
		[
			container(
				[
					textDisplay(
						[
							'## Tracking dashboard',
							'Every tracked player is listed with changes since your last check.',
							bulletList([
								metricLine('Tracked players', record.players.length),
								metricLine('Players with changes', changedCount),
								metricLine('Last refresh', timestamp(record.lastRefreshedAt)),
								metricLine('Last check', timestamp(record.lastViewedAt)),
							]),
						].join('\n'),
					),
					separator(),
					...(playerSections.length > 0
						? playerSections
						: [textDisplay('**No changes since your last check**\nRefresh later, or add another player to the dashboard.')]),
					separator(false),
					row([
						primaryButton(customId('track', 'refresh'), 'Refresh all'),
						secondaryButton(customId('track', 'add'), 'Add player'),
						secondaryButton(customId('track', 'public'), 'Show publicly'),
					]),
				],
				{
					accentColor: changedCount > 0 ? UI_ACCENT_WARNING : UI_ACCENT_SUCCESS,
				},
			),
		],
		ephemeral ? 64 : 0,
	);
}

function helpDashboardMessage(options) {
	const section2 = options.section || 'start';
	const support = supportServerUrl(options.env);
	const sections = {
		start: {
			title: 'Patch dashboard',
			summary: 'Choose how Patch replies, open player tools, and manage your Critical Ops tracking list.',
			lines: [
				'`/profile` posts the clean player card.',
				'`/stats` opens the dashboard with profile, compare, track, and report controls.',
				'`/track player:<name-or-id>` adds a player and returns your tracking dashboard.',
			],
		},
		privacy: {
			title: 'Private output',
			summary: 'Supported commands have an optional `private:true` flag for an ephemeral response.',
			lines: [
				'Available on `/profile`, `/stats`, `/help`, and `/compare`.',
				'`/track` opens privately and includes a Show publicly button.',
				'Reports use private forms and direct messages for reporter updates.',
				'Leave `private` empty when you want the server to see the result.',
			],
		},
		tracking: {
			title: 'Tracking',
			summary: '`/track` opens your player watchlist and compares players against your last check.',
			lines: [
				'Add with `/track player:<name-or-id>` or the Add player button.',
				'Remove a player with the button beside their IGN.',
				'Refresh all updates the dashboard and prepares the next comparison point.',
			],
		},
		reporting: {
			title: 'Reporting',
			summary: '`/report` sends proof and context to staff review.',
			lines: [
				'Use image or video proof with the slash command.',
				'Use Report from player actions when you already have a profile open.',
				'Reporter DMs include the report banner and the staff decision.',
			],
		},
		compare: {
			title: 'Compare',
			summary: '`/compare` builds a scannable matchup board for two players.',
			lines: [
				'The board highlights rank, MMR, peak rank, last online, and current ranked stats.',
				'Use the profile buttons below the comparison to open either player card.',
			],
		},
		about: {
			title: 'Support and about',
			summary: `Support server: ${support}`,
			lines: [
				'Patch is a Critical Ops Discord app for player cards, stats, tracking, comparisons, and reports.',
				'Use the support server for questions, staff review, and setup help.',
			],
		},
	};
	const selectedKey = sections[section2] ? section2 : 'start';
	const selected = sections[selectedKey];
	const actions = [
		row([
			selectMenu(
				customId('help', 'section'),
				'Help sections',
				HELP_SECTIONS.map((option) => ({
					...option,
					default: option.value === selectedKey,
				})),
			),
		]),
	];
	return v2Message([
		dashboardContainer(
			selected.title,
			selected.summary,
			[
				{
					title: 'Details',
					lines: selected.lines,
				},
			],
			actions,
		),
	]);
}

function reportDmImageUrl(env) {
	return env.REPORT_DM_IMAGE_URL?.trim() || embedImage('report').url;
}

function reportDmEmbed(options) {
	const description = options.lines
		.filter((line) => Boolean(line))
		.map((line) => `\u2022 ${line}`)
		.join('\n');
	return {
		embeds: [
			{
				title: options.title,
				description,
				color: options.color,
				image: {
					url: reportDmImageUrl(options.env),
				},
				timestamp: options.timestamp || /* @__PURE__ */ new Date().toISOString(),
			},
		],
		allowed_mentions: {
			parse: [],
		},
	};
}

function proofStatus(proof) {
	if (!proof?.url) {
		return 'No proof attached';
	}
	if (proof.contentType?.startsWith('video/')) {
		return 'Video proof attached';
	}
	if (proof.contentType?.startsWith('image/')) {
		return 'Image proof attached';
	}
	return 'Evidence link attached';
}

function declineGuidance(reason) {
	const normalized = (reason || '').toLowerCase();
	if (normalized.includes('not enough evidence')) {
		return 'No bad vibes. Keep sending clean proof when something feels off; good reports still help the team move faster.';
	}
	if (normalized.includes('wrong player')) {
		return 'Double-check the player ID or profile before sending. You can use `/stats` to verify you have the right person.';
	}
	if (normalized.includes('clip too short')) {
		return 'Longer clips help staff see the full picture \u2014 setup, action, and aftermath. Aim for at least 15\u201330 seconds of context around the incident.';
	}
	if (normalized.includes('already handled')) {
		return 'Staff already had this one covered \u2014 no extra action was needed from your side. Your vigilance is still appreciated.';
	}
	return 'No bad vibes. Keep sending clean proof when something feels off; good reports still help the team move faster.';
}

function reportReceiptSubmitted(options) {
	const { report } = options;
	return reportDmEmbed({
		env: options.env,
		title: 'Report received.',
		lines: [
			`Your report on **${report.targetName}** is now in the staff queue.`,
			`${proofStatus(report.proof)}.`,
			`You'll get a DM when staff reach a decision.`,
		],
		color: UI_ACCENT,
		timestamp: report.createdAt,
	});
}

function reportReceiptAccepted(options) {
	const { report } = options;
	return reportDmEmbed({
		env: options.env,
		title: 'Report accepted. Good eye.',
		lines: [
			`Your report on **${report.targetName}** checked out.`,
			report.publicReason ? `Staff marked it as **${report.publicReason}**.` : undefined,
		],
		color: UI_ACCENT_SUCCESS,
		timestamp: report.reviewedAt || report.createdAt,
	});
}

function reportReceiptRejected(options) {
	const { report } = options;
	return reportDmEmbed({
		env: options.env,
		title: 'Report reviewed. No action this time.',
		lines: [
			`Staff looked at your report on **${report.targetName}**.`,
			report.publicReason ? `Decision: **${report.publicReason}**.` : undefined,
			declineGuidance(report.publicReason),
		],
		color: UI_ACCENT_MUTED,
		timestamp: report.reviewedAt || report.createdAt,
	});
}

function reportReceiptBanConfirmed(options) {
	const { report } = options;
	return reportDmEmbed({
		env: options.env,
		title: 'Bullseye. They got banned.',
		lines: [
			`The player you reported, **${report.targetName}**, is now banned in-game.`,
			report.publicReason ? `Your accepted report: **${report.publicReason}**.` : undefined,
		],
		color: UI_ACCENT_WARNING,
		timestamp: report.banConfirmedAt || report.reviewedAt || report.createdAt,
	});
}

function reportReceiptMessage(options) {
	const { report } = options;
	if (report.status === 'ban_confirmed') {
		return reportReceiptBanConfirmed(options);
	}
	if (report.status === 'accepted') {
		return reportReceiptAccepted(options);
	}
	if (report.status === 'rejected') {
		return reportReceiptRejected(options);
	}
	return reportReceiptSubmitted(options);
}

function communityRecapMessage(recap) {
	const movementLines = recap.topRankMovements.length
		? recap.topRankMovements.map(
				(movement) => `${movement.playerName}: **+${movement.mmrDelta || 0} MMR**${movement.rank ? `, ${movement.rank}` : ''}`,
			)
		: ['No positive tracked rank movement in the baseline yet.'];
	return v2Message([
		container(
			[
				textDisplay(
					[
						`## Community recap: ${recap.month}`,
						'No personal shaming; this is a high-level moderation and movement summary.',
						bulletList([
							metricLine('Reports reviewed', recap.reportsReviewed),
							metricLine('Accepted', recap.reportsAccepted),
							metricLine('Declined', recap.reportsDeclined),
							metricLine('Bans confirmed', recap.bansConfirmed),
						]),
					].join('\n'),
				),
				separator(false),
				textDisplay(`**Top tracked rank movements**
${bulletList(movementLines)}`),
			],
			{
				accentColor: UI_ACCENT_SUCCESS,
			},
		),
	]);
}

function devDashboardMessage(message, ok = true) {
	return v2Message(
		[
			container(
				[
					textDisplay(`## Developer tools
${message}`),
				],
				{
					accentColor: ok ? UI_ACCENT_SUCCESS : UI_ACCENT_DANGER,
				},
			),
		],
		64,
	);
}

function simpleErrorMessage(title, message, ephemeral = true) {
	return v2Message(
		[
			container(
				[
					textDisplay(`## ${title}
${message}`),
				],
				{
					accentColor: UI_ACCENT_DANGER,
				},
			),
		],
		ephemeral ? 64 : 0,
	);
}

export {
	communityRecapMessage,
	compareMessage,
	devDashboardMessage,
	helpDashboardMessage,
	profileCardAttachmentMessage,
	profileCardContainerMessage,
	reportReceiptMessage,
	simpleErrorMessage,
	statsDashboardMessage,
	trackingDashboardMessage,
};
