import { createExecutionContext } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import worker, { DISCORD_COMMANDS, buildCompareEmbed, handleInteraction } from '../src/index';
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
		const response = await worker.fetch(request, { DISCORD_APPLICATION_ID: '123456789' } as BotEnv, createExecutionContext());
		const html = await response.text();

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('text/html');
		expect(response.headers.get('content-security-policy')).toContain("default-src 'none'");
		expect(html).toContain('<title>Patch — Critical Ops player tools for Discord</title>');
		expect(html).toContain('<span>Player</span>');
		expect(html).toContain('client_id=123456789');
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
		expect(html).toContain('https://robbeswinnen.github.io/patch/');

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

	it('rejects unsigned interaction requests', async () => {
		const unsigned = await worker.fetch(
			new Request('https://patch.example/', {
				method: 'POST',
				body: '{}',
			}),
			{} as BotEnv,
			createExecutionContext(),
		);
		expect(unsigned.status).toBe(401);
	});
});
