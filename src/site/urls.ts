import type { Env } from '../types';

const PATCH_DOCS_URL = 'https://github.com/robbeswinnen/patch';

function safeUrl(value: string | undefined, protocols: readonly string[]): string | undefined {
	if (!value?.trim()) {
		return undefined;
	}
	try {
		const url = new URL(value.trim());
		return protocols.includes(url.protocol) ? url.toString() : undefined;
	} catch {
		return undefined;
	}
}

export function htmlEscape(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function addPatchUrl(env: Env): string {
	const configured = safeUrl(env.PATCH_INVITE_URL, ['https:']);
	if (configured) {
		return configured;
	}
	const applicationId = env.DISCORD_APPLICATION_ID?.trim();
	if (!applicationId || !/^\d+$/.test(applicationId)) {
		return safeUrl(env.SUPPORT_SERVER_URL, ['https:']) ?? PATCH_DOCS_URL;
	}
	// A Discord-provided link uses the application's default install settings,
	// allowing Discord to offer both user and server installation when enabled.
	const params = new URLSearchParams({ client_id: applicationId });
	return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export type SiteLinks = {
	addPatch: string;
	support: string;
	canonical: string;
	docs: string;
};

export function siteLinks(request: Request, env: Env): SiteLinks {
	const requestOrigin = new URL(request.url).origin;
	return {
		addPatch: addPatchUrl(env),
		support: safeUrl(env.SUPPORT_SERVER_URL, ['https:']) ?? PATCH_DOCS_URL,
		canonical: safeUrl(env.WEBSITE_URL, ['https:', 'http:']) ?? requestOrigin,
		docs: PATCH_DOCS_URL,
	};
}
