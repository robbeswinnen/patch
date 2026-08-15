// @ts-nocheck
// Type annotations were erased by the deployed bundle; see docs/RECOVERY_NOTES.md.

// Kept byte-for-byte equivalent to the recovered deployment for bot behavior parity.
// The website uses its own safe fallback in src/site/urls.ts.
const DEFAULT_SUPPORT_SERVER_URL = 'https://discord.gg/QW7CZczhT4';
const DEVELOPER_HANDLES = ['@xepp._.'];
const DEVELOPER_CREDIT = `MADE BY ${DEVELOPER_HANDLES.join(' / ')}`;
function supportServerUrl(env) {
	return env?.SUPPORT_SERVER_URL?.trim() || DEFAULT_SUPPORT_SERVER_URL;
}

function compactUrlLabel(url) {
	return url
		.replace(/^https?:\/\//i, '')
		.replace(/^www\./i, '')
		.replace(/\/+$/g, '');
}

function supportServerLabel(env) {
	return compactUrlLabel(supportServerUrl(env));
}

export { DEVELOPER_CREDIT, supportServerLabel, supportServerUrl };
