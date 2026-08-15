import { createExecutionContext } from 'cloudflare:test';
import { describe, expect, it, vi } from 'vitest';
import worker, { DISCORD_COMMANDS, buildCompareEmbed, handleInteraction } from '../src/index';
import { buildPlayerCardSvg } from '../src/lib/card-image';
import type { Env as BotEnv } from '../src/types';

function sampleProfile(name: string, id: number, mmr: number) {
	return {
		basicInfo: {
			userID: id,
			name,
			playerLevel: { level: 88 },
		},
		stats: {
			seasonal_stats: [
				{
					season: 17,
					ranked: { k: 20, d: 10, a: 5, w: 4, l: 2 },
				},
			],
			ranked: {
				placement_matches_left: 0,
				wins: 4,
				losses: 2,
				mmr,
				rank: 6,
			},
		},
	};
}

describe('recovered Patch Worker', () => {
	it('exports the deployed command set and installation contexts', () => {
		expect(DISCORD_COMMANDS.map((command) => command.name)).toEqual(['profile', 'report', 'stats', 'track', 'help', 'compare', 'dev']);

		for (const command of DISCORD_COMMANDS) {
			expect(command.integration_types).toEqual([0, 1]);
			expect(command.contexts).toEqual([0, 1, 2]);
		}

		const privateCommands = new Set(['profile', 'stats', 'help', 'compare']);
		for (const command of DISCORD_COMMANDS) {
			const hasPrivateOption = command.options?.some((option: { name?: string }) => option.name === 'private');
			expect(Boolean(hasPrivateOption)).toBe(privateCommands.has(command.name));
		}
	});

	it("answers Discord's interaction ping", async () => {
		const response = await handleInteraction({ type: 1 }, {}, undefined);
		await expect(response.json()).resolves.toEqual({ type: 1 });
	});

	it('returns a Components V2 error for unknown commands', async () => {
		const response = await handleInteraction({ type: 2, data: { name: 'missing' } }, {}, undefined);
		const body = (await response.json()) as {
			type: number;
			data: { flags: number; components: unknown[] };
		};

		expect(body.type).toBe(4);
		expect(body.data.flags & 64).toBe(64);
		expect(JSON.stringify(body.data.components)).toContain('Command unavailable');
	});

	it('builds the deployed comparison card', () => {
		const card = buildCompareEmbed(sampleProfile('PlayerOne', 111, 1661), sampleProfile('PlayerTwo', 222, 1750));

		expect(card.title).toBe('PlayerOne vs PlayerTwo');
		expect(card.description).toContain('Current-season matchup');
		expect(card.fields).toHaveLength(5);
		expect(card.fields[0].value).toContain('current-season edge');
	});

	it('serves the Pijon-inspired Patch marketing homepage securely', async () => {
		const request = new Request('https://patch.example/');
		const response = await worker.fetch(
			request,
			{
				DISCORD_APPLICATION_ID: '123456789',
				SUPPORT_SERVER_URL: 'https://discord.gg/QW7CZczhT4',
			} as BotEnv,
			createExecutionContext(),
		);
		const html = await response.text();

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('text/html');
		expect(response.headers.get('content-security-policy')).toContain("default-src 'none'");
		expect(html).toContain('<title>Patch — Critical Ops player tools for Discord</title>');
		expect(html).toContain('<span>Player</span>');
		expect(html).toContain('client_id=123456789');
		expect(html).not.toContain('scope=bot');
		expect(html).toContain('https://discord.gg/QW7CZczhT4');
		expect(html).not.toContain('data:image/');
	});

	it('serves cacheable site resources, HEAD, safe URL fallbacks, and a real 404', async () => {
		const env = {
			DISCORD_APPLICATION_ID: '123456789',
			PATCH_INVITE_URL: 'javascript:alert(1)',
			SUPPORT_SERVER_URL: 'data:text/html,unsafe',
		} as BotEnv;

		const homepage = await worker.fetch(new Request('https://patch.example/'), env, createExecutionContext());
		const html = await homepage.text();
		expect(html).not.toContain('javascript:');
		expect(html).not.toContain('data:text/html');
		expect(html).toContain('https://github.com/robbeswinnen/patch');

		const css = await worker.fetch(new Request('https://patch.example/patch.css'), env, createExecutionContext());
		expect(css.headers.get('content-type')).toContain('text/css');
		await expect(css.text()).resolves.toContain('--hero-ribbon-main');

		const image = await worker.fetch(new Request('https://patch.example/assets/rank-master.png'), env, createExecutionContext());
		expect(image.headers.get('content-type')).toBe('image/png');
		expect((await image.arrayBuffer()).byteLength).toBeGreaterThan(1_000);

		const head = await worker.fetch(new Request('https://patch.example/', { method: 'HEAD' }), env, createExecutionContext());
		expect(head.status).toBe(200);
		await expect(head.text()).resolves.toBe('');

		const missing = await worker.fetch(new Request('https://patch.example/not-a-page'), env, createExecutionContext());
		expect(missing.status).toBe(404);
		await expect(missing.text()).resolves.toContain('That Patch page does not exist.');
	});

	it('rejects unsigned and oversized interaction requests before buffering their bodies', async () => {
		const unsignedRequest = new Request('https://patch.example/', {
			method: 'POST',
			body: '{}',
		});
		const unsignedText = vi.spyOn(unsignedRequest, 'text').mockRejectedValue(new Error('Body should not be read.'));
		const unsigned = await worker.fetch(unsignedRequest, {} as BotEnv, createExecutionContext());
		expect(unsigned.status).toBe(401);
		expect(unsignedText).not.toHaveBeenCalled();

		const oversizedRequest = new Request('https://patch.example/', {
			method: 'POST',
			headers: {
				'content-length': '1048577',
				'x-signature-ed25519': 'test-signature',
				'x-signature-timestamp': 'test-timestamp',
			},
			body: '{}',
		});
		const oversizedText = vi.spyOn(oversizedRequest, 'text').mockRejectedValue(new Error('Body should not be read.'));
		const oversized = await worker.fetch(oversizedRequest, { DISCORD_PUBLIC_KEY: 'test-public-key' } as BotEnv, createExecutionContext());
		expect(oversized.status).toBe(413);
		expect(oversizedText).not.toHaveBeenCalled();

		const streamedOversizedRequest = new Request('https://patch.example/', {
			method: 'POST',
			headers: {
				'x-signature-ed25519': 'test-signature',
				'x-signature-timestamp': 'test-timestamp',
			},
			body: 'x'.repeat(1024 * 1024 + 1),
		});
		expect(streamedOversizedRequest.headers.has('content-length')).toBe(false);
		const streamedOversized = await worker.fetch(
			streamedOversizedRequest,
			{ DISCORD_PUBLIC_KEY: 'test-public-key' } as BotEnv,
			createExecutionContext(),
		);
		expect(streamedOversized.status).toBe(413);
	});

	it('uses SUPPORT_SERVER_URL in profile-card support metadata', () => {
		const random = vi.spyOn(Math, 'random').mockReturnValue(0);
		try {
			const svg = buildPlayerCardSvg(sampleProfile('PlayerOne', 111, 1661), 'Patch', undefined, [], undefined, {
				SUPPORT_SERVER_URL: 'https://discord.gg/patch-test/',
			} as BotEnv);

			expect(svg).toContain('SUPPORT · discord.gg/patch-test');
			expect(svg).not.toContain('discord.gg/QW7CZczhT4');
		} finally {
			random.mockRestore();
		}
	});
});
