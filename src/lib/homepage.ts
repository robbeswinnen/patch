import siteScript from '../site/site.client.js';
import siteStyles from '../site/site.css';
import { getSiteAsset } from '../site/assets';
import { homepageHtml, notFoundHtml, sitemapXml } from '../site/template';
import type { Env } from '../types';

const HTML_SECURITY_HEADERS = {
	'Content-Security-Policy': `default-src 'none'; base-uri 'none'; connect-src 'none'; font-src 'self'; form-action 'none'; frame-ancestors 'none'; img-src 'self'; manifest-src 'self'; script-src 'self'; style-src 'self'`,
	'Cross-Origin-Opener-Policy': 'same-origin',
	'Permissions-Policy': 'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
} as const;

function responseBody(includeBody: boolean, body: BodyInit): BodyInit | null {
	return includeBody ? body : null;
}

function marketingHomepage(request: Request, env: Env, includeBody = true): Response {
	const url = new URL(request.url);
	const asset = getSiteAsset(url.pathname);
	if (asset) {
		return new Response(responseBody(includeBody, asset.body), {
			headers: {
				'Cache-Control': 'public, max-age=86400',
				'Content-Type': asset.contentType,
				'X-Content-Type-Options': 'nosniff',
			},
		});
	}

	if (url.pathname === '/patch.css') {
		return new Response(responseBody(includeBody, siteStyles), {
			headers: {
				'Cache-Control': 'public, max-age=3600',
				'Content-Type': 'text/css; charset=utf-8',
				'X-Content-Type-Options': 'nosniff',
			},
		});
	}

	if (url.pathname === '/patch.js') {
		return new Response(responseBody(includeBody, siteScript), {
			headers: {
				'Cache-Control': 'public, max-age=3600',
				'Content-Type': 'text/javascript; charset=utf-8',
				'X-Content-Type-Options': 'nosniff',
			},
		});
	}

	if (url.pathname === '/robots.txt') {
		return new Response(responseBody(includeBody, 'User-agent: *\nAllow: /\n'), {
			headers: {
				'Cache-Control': 'public, max-age=86400',
				'Content-Type': 'text/plain; charset=utf-8',
			},
		});
	}

	if (url.pathname === '/sitemap.xml') {
		return new Response(responseBody(includeBody, sitemapXml(request, env)), {
			headers: {
				'Cache-Control': 'public, max-age=3600',
				'Content-Type': 'application/xml; charset=utf-8',
			},
		});
	}

	const isHomepage = url.pathname === '/' || url.pathname === '/index.html';
	return new Response(responseBody(includeBody, isHomepage ? homepageHtml(request, env) : notFoundHtml()), {
		status: isHomepage ? 200 : 404,
		headers: {
			...HTML_SECURITY_HEADERS,
			'Cache-Control': isHomepage ? 'public, max-age=300' : 'no-store',
			'Content-Type': 'text/html; charset=utf-8',
		},
	});
}

export { marketingHomepage };
