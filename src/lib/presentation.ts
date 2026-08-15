// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.

const EMBED_IMAGES = {
	help: {
		url: 'https://i.imgur.com/mo3ODsK.png',
		note: 'Wide community banner: Patch logo, Critical Ops silhouettes, warm server-hub feel.',
	},
	stats: {
		url: 'https://i.imgur.com/GTjKeqK.png',
		note: 'Player dashboard banner: clean stat panels, rank accent, readable dark UI.',
	},
	clan: {
		url: 'https://i.imgur.com/HXq1UZq.png',
		note: 'Clan banner: team lineup or badge wall, leaderboard energy, not too busy.',
	},
	compare: {
		url: 'https://i.imgur.com/H32d4VT.png',
		note: 'Versus banner: two profile panels facing each other with a subtle center split.',
	},
	track: {
		url: 'https://i.imgur.com/9UOgtlb.png',
		note: 'Could be transparent. If visible, make it a calm tracking dashboard banner.',
	},
	tags: {
		url: 'https://i.imgur.com/riz1PbK.jpg',
		note: 'Account tag guide banner: Patch status badges, friendly guide feel.',
	},
	report: {
		url: 'https://i.imgur.com/PqRb1Xi.png',
		note: 'Could be transparent. If visible, make it a neutral staff-review banner.',
	},
	transparent: {
		url: 'https://i.imgur.com/GgOYRcb.png',
		note: 'Replace with a truly transparent 1600x420 PNG when an embed should keep height without visible art.',
	},
};
function embedImage(name) {
	return {
		url: EMBED_IMAGES[name].url,
	};
}

function quoteList(lines) {
	return lines
		.filter((line) => Boolean(line))
		.map((line) => `> - ${line}`)
		.join('\n');
}

function section(title, body) {
	return `**${title}**
${body}`;
}

function pageFooter(page, pages, note) {
	return {
		text: note ? `Page ${page}/${pages} - ${note}` : `Page ${page}/${pages}`,
	};
}

export { embedImage, pageFooter, quoteList, section };
