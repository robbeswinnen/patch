// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';
import monoRegular from '@expo-google-fonts/jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf';
import monoBold from '@expo-google-fonts/jetbrains-mono/700Bold/JetBrainsMono_700Bold.ttf';
import rank0Icon from '../assets/ranks/rank-0-unranked.png';
import rank1Icon from '../assets/ranks/rank-1-bronze.png';
import rank2Icon from '../assets/ranks/rank-2-silver.png';
import rank3Icon from '../assets/ranks/rank-3-gold.png';
import rank4Icon from '../assets/ranks/rank-4-platinum.png';
import rank5Icon from '../assets/ranks/rank-5-diamond.png';
import rank6Icon from '../assets/ranks/rank-6-master.png';
import rank7Icon from '../assets/ranks/rank-7-specops.png';
import rank8Icon from '../assets/ranks/rank-8-elite.png';
import { DEVELOPER_CREDIT, supportServerLabel } from './brand';
import { clanLine, displayName, hasActiveBan, kd, latestSeason, peakRankName, rankName, rankProgress, winRate } from './cops';
import { publicStatusFor } from './player-tags';

const CARD_WIDTH = 1410;
const CARD_HEIGHT = 936;
const CARD_OUTPUT_WIDTH = 1200;
const FONT_BUFFERS = [new Uint8Array(monoRegular), new Uint8Array(monoBold)];
const FONT_FAMILY = 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const DOT = '\xB7';
const STATUS_RIGHT_X = 1336;
const STATUS_ICON_SIZE = 26;
const STATUS_ICON_GAP = 10;
const STATUS_ICON_Y = 835;
let resvgInitPromise;
let resvgWarmupPromise;
const ICONS = {
	// Lucide icon path data, ISC license. Kept inline so the Worker never reads files at runtime.
	ban: ['<circle cx="12" cy="12" r="10" />', '<path d="m4.9 4.9 14.2 14.2" />'],
	crosshair: [
		'<circle cx="12" cy="12" r="10" />',
		'<line x1="22" x2="18" y1="12" y2="12" />',
		'<line x1="6" x2="2" y1="12" y2="12" />',
		'<line x1="12" x2="12" y1="6" y2="2" />',
		'<line x1="12" x2="12" y1="22" y2="18" />',
	],
	trophy: [
		'<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" />',
		'<path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" />',
		'<path d="M18 9h1.5a1 1 0 0 0 0-5H18" />',
		'<path d="M4 22h16" />',
		'<path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />',
		'<path d="M6 9H4.5a1 1 0 0 1 0-5H6" />',
	],
	gem: [
		'<path d="M10.5 3 8 9l4 13 4-13-2.5-6" />',
		'<path d="M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z" />',
		'<path d="M2 9h20" />',
	],
	eye: [
		'<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />',
		'<circle cx="12" cy="12" r="3" />',
	],
	'chevrons-up': ['<path d="m17 11-5-5-5 5" />', '<path d="m17 18-5-5-5 5" />'],
	'shield-alert': [
		'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />',
		'<path d="M12 8v4" />',
		'<path d="M12 16h.01" />',
	],
	'shield-check': [
		'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />',
		'<path d="m9 12 2 2 4-4" />',
	],
	'badge-check': [
		'<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />',
		'<path d="m9 12 2 2 4-4" />',
	],
	handshake: [
		'<path d="m11 17 2 2a1 1 0 1 0 3-3" />',
		'<path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />',
		'<path d="m21 3 1 11h-2" />',
		'<path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />',
		'<path d="M3 4h8" />',
	],
	'code-2': ['<path d="m18 16 4-4-4-4" />', '<path d="m6 8-4 4 4 4" />', '<path d="m14.5 4-5 16" />'],
	clapperboard: [
		'<path d="m12.296 3.464 3.02 3.956" />',
		'<path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z" />',
		'<path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />',
		'<path d="m6.18 5.276 3.1 3.899" />',
	],
	swords: [
		'<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />',
		'<line x1="13" x2="19" y1="19" y2="13" />',
		'<line x1="16" x2="20" y1="16" y2="20" />',
		'<line x1="19" x2="21" y1="21" y2="19" />',
		'<polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />',
		'<line x1="5" x2="9" y1="14" y2="18" />',
		'<line x1="7" x2="4" y1="17" y2="20" />',
		'<line x1="3" x2="5" y1="19" y2="21" />',
	],
	'calendar-days': [
		'<path d="M8 2v4" />',
		'<path d="M16 2v4" />',
		'<rect width="18" height="18" x="3" y="4" rx="2" />',
		'<path d="M3 10h18" />',
		'<path d="M8 14h.01" />',
		'<path d="M12 14h.01" />',
		'<path d="M16 14h.01" />',
		'<path d="M8 18h.01" />',
		'<path d="M12 18h.01" />',
		'<path d="M16 18h.01" />',
	],
};
const RANK_ICON_DATA_URIS = [rank0Icon, rank1Icon, rank2Icon, rank3Icon, rank4Icon, rank5Icon, rank6Icon, rank7Icon, rank8Icon].map(
	pngDataUri,
);
const WARMUP_PROFILE = {
	basicInfo: {
		userID: 0,
		name: 'Warmup',
		playerLevel: {
			level: 88,
		},
	},
	clan: {
		basicInfo: {
			name: 'Patch',
			tag: 'BOT',
		},
		memberRank: 40,
	},
	stats: {
		seasonal_stats: [
			{
				season: 17,
				ranked: {
					k: 20,
					d: 10,
					a: 5,
					w: 4,
					l: 2,
				},
			},
		],
		ranked: {
			placement_matches_left: 0,
			wins: 4,
			losses: 2,
			mmr: 1661,
			rank: 6,
		},
	},
};
function escapeXml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function truncate(value, maxLength) {
	return value.length > maxLength ? `${value.slice(0, Math.max(0, maxLength - 1))}.` : value;
}

function formatRawId(value) {
	return typeof value === 'number' && Number.isFinite(value) ? String(Math.trunc(value)) : 'UNKNOWN';
}

function compactPercent(value) {
	return value.replace('.0%', '%');
}

function compactDecimal(value) {
	return value.toFixed(1).replace(/\.0$/, '');
}

function formatLookupCountLabel(value) {
	const count = typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
	if (count >= 1e6) {
		return `${compactDecimal(Math.floor(count / 1e5) / 10)}M`;
	}
	if (count >= 1e4) {
		return `${Math.floor(count / 1e3)}K`;
	}
	if (count >= 1e3) {
		return `${compactDecimal(Math.floor(count / 100) / 10)}K`;
	}
	if (count >= 100) {
		return `${Math.floor(count / 100) * 100}+`;
	}
	return String(count);
}

function pngDataUri(buffer) {
	const bytes = new Uint8Array(buffer);
	let binary = '';
	for (let index = 0; index < bytes.length; index += 1) {
		binary += String.fromCharCode(bytes[index]);
	}
	return `data:image/png;base64,${btoa(binary)}`;
}

function rankIconIndex(rank) {
	if (/elite/i.test(rank)) return 8;
	if (/spec/i.test(rank)) return 7;
	if (/master/i.test(rank)) return 6;
	if (/diamond/i.test(rank)) return 5;
	if (/platinum/i.test(rank)) return 4;
	if (/gold/i.test(rank)) return 3;
	if (/silver/i.test(rank)) return 2;
	if (/bronze/i.test(rank)) return 1;
	return 0;
}

function rankIcon(rank, x, y) {
	const iconIndex = rankIconIndex(rank);
	const iconUri = RANK_ICON_DATA_URIS[iconIndex] || RANK_ICON_DATA_URIS[0];
	const slotSize = 128;
	const iconSize = 104;
	const iconX = x + (slotSize - iconSize) / 2;
	const iconY = y + (slotSize - iconSize) / 2;
	return [
		`<g data-card-rank-icon="${escapeXml(rank)}">`,
		`<image x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize}" href="${iconUri}" preserveAspectRatio="xMidYMid meet" />`,
		`</g>`,
	].join('');
}

function topMetadataLine(env) {
	return Math.random() < 0.5 ? `SUPPORT ${DOT} ${supportServerLabel(env)}` : DEVELOPER_CREDIT;
}

function text(value, x, y, options = {}) {
	const label = options.maxLength ? truncate(value, options.maxLength) : value;
	const spacing = typeof options.spacing === 'number' ? options.spacing : 0;
	const stroke = options.stroke
		? ` stroke="${options.stroke}" stroke-width="${options.strokeWidth || 0}" paint-order="stroke" stroke-linejoin="round"`
		: '';
	const opacity = typeof options.opacity === 'number' ? ` opacity="${options.opacity}"` : '';
	return `<text x="${x}" y="${y}" fill="${options.fill || '#f4f6f8'}" font-family="${FONT_FAMILY}" font-size="${options.size || 24}" font-weight="${options.weight || 400}" text-anchor="${options.anchor || 'start'}" letter-spacing="${spacing}"${stroke}${opacity}>${escapeXml(label)}</text>`;
}

function icon(name, x, y, size, color = '#8b96a3') {
	const scale = size / 24;
	return `<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name].join('')}</g>`;
}

function peakRankMarker(label, x, y, width, accent) {
	const markerX = x + width - 206;
	return [
		`<rect x="${markerX}" y="${y + 24}" width="174" height="38" fill="#071019" opacity="0.7" stroke="${accent}" stroke-width="1" stroke-opacity="0.5" />`,
		`<rect x="${markerX}" y="${y + 24}" width="174" height="2" fill="${accent}" opacity="0.72" />`,
		`<circle cx="${markerX + 20}" cy="${y + 43}" r="3.5" fill="${accent}" opacity="0.9" />`,
		text('PEAK', markerX + 33, y + 48, {
			size: 13,
			weight: 700,
			fill: '#8b96a3',
			spacing: 2,
		}),
		text(label.toUpperCase(), markerX + 158, y + 48, {
			size: 15,
			weight: 700,
			fill: '#f7f7f4',
			anchor: 'end',
			maxLength: 9,
		}),
	].join('');
}

function statCell(label, value, x, y, width, iconName, accent = '#ff6b21', detail) {
	return [
		`<g>`,
		`<rect x="${x}" y="${y}" width="${width}" height="148" fill="#091018" opacity="0.42" />`,
		icon(iconName, x + 32, y + 24, 20),
		text(label, x + 64, y + 42, {
			size: 19,
			weight: 700,
			fill: '#8b96a3',
			spacing: 3,
		}),
		detail ? peakRankMarker(detail, x, y, width, accent) : '',
		text(value, x + 32, y + 108, {
			size: 45,
			weight: 400,
			fill: '#f7f7f4',
			maxLength: 16,
		}),
		`<rect x="${x + 32}" y="${y + 124}" width="46" height="3" fill="${accent}" />`,
		`</g>`,
	].join('');
}

function lookupMetric(x, y, lookupCount) {
	const label = formatLookupCountLabel(lookupCount);
	return [
		`<g>`,
		`<rect x="${x}" y="${y}" width="154" height="92" fill="#071019" opacity="0.78" stroke="#2d3a45" stroke-width="2" />`,
		`<rect x="${x}" y="${y}" width="154" height="3" fill="#ffb05d" opacity="0.85" />`,
		icon('eye', x + 22, y + 24, 21, '#ffb05d'),
		text('LOOKUPS', x + 57, y + 39, {
			size: 15,
			weight: 700,
			fill: '#8b96a3',
			spacing: 2,
		}),
		text(label, x + 22, y + 75, {
			size: label.length > 4 ? 27 : 31,
			weight: 700,
			fill: '#f7f7f4',
			maxLength: 5,
		}),
		`</g>`,
	].join('');
}

function bannedIdentityTag(x, y) {
	return [
		`<g>`,
		`<rect x="${x}" y="${y}" width="170" height="92" fill="#271012" opacity="0.88" stroke="#7d2d33" stroke-width="2" />`,
		`<rect x="${x}" y="${y}" width="170" height="3" fill="#ff6f66" opacity="0.92" />`,
		icon('ban', x + 23, y + 22, 25, '#ff8a82'),
		text('BANNED', x + 61, y + 41, {
			size: 20,
			weight: 700,
			fill: '#ff8a82',
			spacing: 3,
		}),
		text('IN-GAME', x + 23, y + 74, {
			size: 16,
			weight: 700,
			fill: '#b48786',
			spacing: 2,
		}),
		`</g>`,
	].join('');
}

function identityMetaPanel(lookupCount, banned) {
	const lookupX = banned ? 990 : 1182;
	return [`<g>`, lookupMetric(lookupX, 250, lookupCount), banned ? bannedIdentityTag(1166, 250) : '', `</g>`].join('');
}

function progressBar(percent, x, y, width) {
	const pct = typeof percent === 'number' && Number.isFinite(percent) ? Math.round(percent) : 0;
	const fillWidth = Math.max(0, Math.min(width, (pct / 100) * width));
	return [
		`<rect x="${x}" y="${y}" width="${width}" height="12" fill="#202b36" />`,
		`<rect x="${x}" y="${y}" width="${fillWidth.toFixed(2)}" height="12" fill="#ff6b21" />`,
		text(`${pct}%`, x + width, y - 24, {
			size: 21,
			weight: 700,
			fill: '#ff8a32',
			anchor: 'end',
			spacing: 2,
		}),
	].join('');
}

function cardStatusText(status) {
	if (status.kind === 'report') {
		return `COMMUNITY REPORT ${DOT} ${status.reportReason.toUpperCase()}`;
	}
	if (status.kind === 'tags') {
		return status.tags.map((tag) => tag.label.toUpperCase()).join(` ${DOT} `);
	}
	return 'SECURE';
}

function estimateStatusTextWidth(value, size, spacing, maxLength) {
	const label = truncate(value, maxLength);
	const characterWidth = size * 0.62;
	return label.length * characterWidth + Math.max(0, label.length - 1) * spacing;
}

function statusPlacement(status, value) {
	if (status.kind === 'report') {
		const placement2 = { size: 17, maxLength: 34, spacing: 0 };
		return {
			...placement2,
			iconX: Math.max(
				860,
				STATUS_RIGHT_X -
					estimateStatusTextWidth(value, placement2.size, placement2.spacing, placement2.maxLength) -
					STATUS_ICON_SIZE -
					STATUS_ICON_GAP,
			),
			textX: STATUS_RIGHT_X,
		};
	}
	if (status.kind === 'tags') {
		const placement2 = { size: 19, maxLength: 32, spacing: 1 };
		return {
			...placement2,
			iconX: Math.max(
				860,
				STATUS_RIGHT_X -
					estimateStatusTextWidth(value, placement2.size, placement2.spacing, placement2.maxLength) -
					STATUS_ICON_SIZE -
					STATUS_ICON_GAP,
			),
			textX: STATUS_RIGHT_X,
		};
	}
	const placement = { size: 20, maxLength: 16, spacing: 3 };
	return {
		...placement,
		iconX:
			STATUS_RIGHT_X -
			estimateStatusTextWidth(value, placement.size, placement.spacing, placement.maxLength) -
			STATUS_ICON_SIZE -
			STATUS_ICON_GAP,
		textX: STATUS_RIGHT_X,
	};
}

function statusMarker(status, value) {
	const placement = statusPlacement(status, value);
	return icon(status.icon, placement.iconX, STATUS_ICON_Y, STATUS_ICON_SIZE, status.color);
}

function buildPlayerCardSvg(profile, _requestedBy = 'Patch', report, tags = [], lookupCount, env) {
	const name = displayName(profile);
	const season = latestSeason(profile);
	const ranked = season?.ranked;
	const level = profile.basicInfo?.playerLevel?.level;
	const levelLabel = typeof level === 'number' && Number.isFinite(level) ? String(level) : '?';
	const currentRank = rankName(profile.stats?.ranked);
	const peakRank = peakRankName(profile.stats?.ranked);
	const progress = rankProgress(profile.stats?.ranked);
	const banned = hasActiveBan(profile.ban);
	const status = publicStatusFor(report, tags);
	const statusText = cardStatusText(status);
	const statusPosition = statusPlacement(status, statusText);
	const topMetadata = topMetadataLine(env);
	const identity = `${formatRawId(profile.basicInfo?.userID)} ${DOT} ${clanLine(profile)}`;
	const footerLabel = `LAST SYNC ${DOT} JUST NOW`;
	const progressLabel = `RANK PROGRESS ${DOT} ${currentRank.toUpperCase()} -> ${progress.nextLabel.toUpperCase()}`;
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <defs>
    <linearGradient id="card-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#101820" />
      <stop offset="58%" stop-color="#050b11" />
      <stop offset="100%" stop-color="#111820" />
    </linearGradient>
    <linearGradient id="ban-glow" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#ff3b30" stop-opacity="0.34" />
      <stop offset="42%" stop-color="#ff3b30" stop-opacity="0.13" />
      <stop offset="100%" stop-color="#ff3b30" stop-opacity="0" />
    </linearGradient>
    <pattern id="fine-grid" width="44" height="44" patternUnits="userSpaceOnUse">
      <path d="M44 0 L0 0 0 44" fill="none" stroke="#1a2631" stroke-width="1" opacity="0.35" />
    </pattern>
  </defs>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="#05080d" />
  <rect x="25" y="24" width="1360" height="888" fill="url(#card-bg)" stroke="#25313c" stroke-width="2" />
  <rect x="25" y="24" width="1360" height="888" fill="url(#fine-grid)" opacity="0.22" />
  ${banned ? `<rect x="0" y="0" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#ban-glow)" />` : ''}
  <path d="M25 24 H58 L25 56 Z M1385 24 H1354 L1385 56 Z M25 912 H58 L25 880 Z M1385 912 H1354 L1385 880 Z" fill="#ff6b21" />
  <path d="M10 8 H57 M10 8 V55 M1400 8 H1355 M1400 8 V55 M10 928 H57 M10 928 V881 M1400 928 H1355 M1400 928 V881" stroke="#ff6b21" stroke-width="4" fill="none" />
  <path d="M76 136 H1336" stroke="#26313b" stroke-width="2" />
  <circle cx="1273" cy="88" r="8" fill="#e9323d" />
  <circle cx="1301" cy="88" r="8" fill="#e86c2a" />
  <circle cx="1329" cy="88" r="8" fill="#11d1d6" />

  ${text('PATCH', 76, 94, { size: 20, weight: 700, fill: '#11d1d6', spacing: 5 })}
  ${text(`${DOT} PROFILE CARD`, 174, 94, {
		size: 20,
		weight: 700,
		fill: '#8b96a3',
		maxLength: 34,
	})}
  ${text(topMetadata, 76, 201, { size: 24, fill: '#f7f7f4', maxLength: 56 })}

  ${rankIcon(currentRank, 76, 233)}
  ${text(name, 236, 295, { size: 39, fill: '#f7f7f4', maxLength: 24 })}
  <circle cx="243" cy="326" r="8" fill="#11d1d6" />
  ${text(identity, 267, 333, {
		size: 22,
		fill: '#8b96a3',
		maxLength: 48,
	})}
  ${identityMetaPanel(lookupCount, banned)}

  <rect x="76" y="402" width="1260" height="300" fill="#071019" opacity="0.68" />
  <path d="M706 402 V702 M76 552 H1336" stroke="#26313b" stroke-width="2" />
  ${statCell('K/D RATIO', kd(ranked), 76, 402, 630, 'crosshair', '#ff6b21')}
  ${statCell('WIN RATE', compactPercent(winRate(ranked)), 706, 402, 630, 'trophy', '#11d1d6')}
  ${statCell('RANK', currentRank, 76, 552, 630, 'gem', '#11d1d6', peakRank)}
  ${statCell('LEVEL', levelLabel, 706, 552, 630, 'chevrons-up', '#ff6b21')}

  ${text(progressLabel, 76, 765, {
		size: 20,
		weight: 700,
		fill: '#8b96a3',
		spacing: 4,
		maxLength: 48,
	})}
  ${progressBar(progress.percent, 76, 789, 1260)}

  ${text(footerLabel, 76, 856, {
		size: 20,
		weight: 700,
		fill: '#8b96a3',
		spacing: 4,
		maxLength: 48,
	})}
  ${statusMarker(status, statusText)}
  ${text(statusText, statusPosition.textX, 856, {
		size: statusPosition.size,
		weight: 700,
		fill: status.color,
		anchor: 'end',
		maxLength: statusPosition.maxLength,
		spacing: statusPosition.spacing,
	})}
</svg>`;
}

function ensureResvgInitialized() {
	resvgInitPromise ||= initWasm(resvgWasm).catch((error) => {
		resvgInitPromise = undefined;
		throw error;
	});
	return resvgInitPromise;
}

function renderSvgToPng(svg) {
	const renderer = new Resvg(svg, {
		fitTo: { mode: 'width', value: CARD_OUTPUT_WIDTH },
		font: {
			loadSystemFonts: false,
			defaultFontFamily: 'JetBrains Mono',
			sansSerifFamily: 'JetBrains Mono',
			monospaceFamily: 'JetBrains Mono',
			fontBuffers: FONT_BUFFERS,
		},
	});
	let rendered;
	try {
		rendered = renderer.render();
		return rendered.asPng();
	} finally {
		rendered?.free();
		renderer.free();
	}
}

async function warmPlayerCardRenderer() {
	resvgWarmupPromise ||= (async () => {
		await ensureResvgInitialized();
		renderSvgToPng(buildPlayerCardSvg(WARMUP_PROFILE, 'Patch'));
	})().catch((error) => {
		resvgWarmupPromise = undefined;
		throw error;
	});
	return resvgWarmupPromise;
}

async function renderPlayerCardPng(profile, requestedBy, report, tags = [], lookupCount, env) {
	await ensureResvgInitialized();
	const png = renderSvgToPng(buildPlayerCardSvg(profile, requestedBy, report, tags, lookupCount, env));
	resvgWarmupPromise ||= Promise.resolve();
	return png;
}

export { buildPlayerCardSvg, renderPlayerCardPng, warmPlayerCardRenderer };
