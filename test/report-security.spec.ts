import { createExecutionContext, env as testEnv, waitOnExecutionContext } from 'cloudflare:test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleInteraction } from '../src/index';
import { runBanWatcher } from '../src/lib/ban-watcher';
import { getAcceptedReport, getPendingReport, getReporterReputation, putAcceptedReport, putPendingReport } from '../src/lib/storage';
import type { Env as BotEnv } from '../src/types';

function botEnv(overrides: Partial<BotEnv> = {}): BotEnv {
	return {
		USER_PREFERENCES: testEnv.USER_PREFERENCES,
		...overrides,
	} as BotEnv;
}

async function interactionBody(response: Response) {
	return (await response.json()) as {
		type: number;
		data: {
			custom_id?: string;
			flags?: number;
			components?: unknown[];
		};
	};
}

function reviewInteraction(type: 3 | 5, channelId: string, customId: string) {
	return {
		type,
		channel_id: channelId,
		member: { user: { id: 'reviewer-1' } },
		data: {
			custom_id: customId,
			components:
				type === 5
					? [
							{
								type: 18,
								component: { type: 4, custom_id: 'report_public_reason', value: 'Confirmed cheating' },
							},
							{
								type: 18,
								component: { type: 4, custom_id: 'report_reviewer_note', value: 'The attached clip confirms it.' },
							},
						]
					: undefined,
		},
	};
}

function stubProfileAndDiscord(profile: unknown) {
	vi.stubGlobal(
		'fetch',
		vi.fn(async (input: RequestInfo | URL) => {
			const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
			if (url.startsWith('https://default.prod.copsapi.criticalforce.fi/api/public/profile')) {
				return Response.json([profile]);
			}
			if (url.endsWith('/users/@me/channels')) {
				return Response.json({ id: 'dm-channel' });
			}
			if (url.includes('/channels/dm-channel/messages')) {
				return Response.json({ id: 'dm-message' });
			}
			if (url.includes('/webhooks/')) {
				return Response.json({ id: 'edited-message' });
			}
			throw new Error(`Unexpected fetch in test: ${url}`);
		}),
	);
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('report release blockers', () => {
	it('fails report-review buttons closed outside the configured staff channel', async () => {
		const env = botEnv({ SUPPORT_REPORT_CHANNEL_ID: 'staff-channel' });
		await putPendingReport(env, {
			id: 'review-channel-report',
			reporterId: 'reporter-1',
			targetPlayerId: 'player-1',
			targetName: 'Player One',
			reason: 'Cheating',
			status: 'pending',
			createdAt: '2026-08-15T12:00:00.000Z',
		});

		for (const response of [
			await handleInteraction(reviewInteraction(3, 'other-channel', 'report_accept:review-channel-report'), env, undefined),
			await handleInteraction(reviewInteraction(3, 'staff-channel', 'report_accept:review-channel-report'), botEnv(), undefined),
		]) {
			const body = await interactionBody(response);
			expect(body.type).toBe(4);
			expect(body.data.flags! & 64).toBe(64);
			expect(JSON.stringify(body.data.components)).toContain('configured staff channel');
		}

		const allowed = await interactionBody(
			await handleInteraction(reviewInteraction(3, 'staff-channel', 'report_accept:review-channel-report'), env, undefined),
		);
		expect(allowed.type).toBe(9);
		expect(allowed.data.custom_id).toBe('report_review:accept:review-channel-report');
	});

	it('fails report-review modal submissions closed without mutating the report', async () => {
		const env = botEnv({ SUPPORT_REPORT_CHANNEL_ID: 'staff-channel' });
		await putPendingReport(env, {
			id: 'review-modal-report',
			reporterId: 'reporter-2',
			targetPlayerId: 'player-2',
			targetName: 'Player Two',
			reason: 'Cheating',
			status: 'pending',
			createdAt: '2026-08-15T12:00:00.000Z',
		});

		for (const response of [
			await handleInteraction(reviewInteraction(5, 'other-channel', 'report_review:accept:review-modal-report'), env, undefined),
			await handleInteraction(reviewInteraction(5, 'staff-channel', 'report_review:accept:review-modal-report'), botEnv(), undefined),
		]) {
			const body = await interactionBody(response);
			expect(body.type).toBe(4);
			expect(JSON.stringify(body.data.components)).toContain('configured staff channel');
		}

		expect((await getPendingReport(env, 'review-modal-report'))?.status).toBe('pending');
		expect(await getAcceptedReport(env, 'player-2')).toBeUndefined();
	});

	it('records automatic duplicate submissions and acceptances together', async () => {
		const env = botEnv({
			DISCORD_APPLICATION_ID: 'application-1',
			DISCORD_TOKEN: 'test-token',
			SUPPORT_REPORT_CHANNEL_ID: 'staff-channel',
		});
		await putAcceptedReport(env, {
			reportId: 'original-report',
			playerId: '808',
			playerName: 'Existing Player',
			reason: 'Accepted reason',
			reporterId: 'original-reporter',
			acceptedBy: 'reviewer-1',
			acceptedAt: '2026-08-14T12:00:00.000Z',
		});
		stubProfileAndDiscord({
			basicInfo: { userID: 808, name: 'Existing Player', playerLevel: { level: 50 } },
			stats: { seasonal_stats: [], ranked: { mmr: 1500, rank: 5 } },
		});

		const command = await interactionBody(
			await handleInteraction(
				{
					type: 2,
					token: 'command-token',
					user: { id: 'duplicate-reporter' },
					data: {
						name: 'report',
						options: [
							{ name: 'player', value: '808' },
							{ name: 'proof', value: 'proof-1' },
						],
						resolved: {
							attachments: {
								'proof-1': {
									id: 'proof-1',
									filename: 'proof.png',
									content_type: 'image/png',
									url: 'https://evidence.example/proof.png',
								},
							},
						},
					},
				},
				env,
				undefined,
			),
		);
		expect(command.type).toBe(9);

		const ctx = createExecutionContext();
		const submitted = await interactionBody(
			await handleInteraction(
				{
					type: 5,
					token: 'modal-token',
					user: { id: 'duplicate-reporter' },
					data: {
						custom_id: command.data.custom_id,
						components: [
							{ type: 18, component: { type: 4, custom_id: 'report_reason', value: 'Cheating' } },
							{
								type: 18,
								component: {
									type: 4,
									custom_id: 'report_details',
									value: 'The clip shows a clear and repeatable violation.',
								},
							},
						],
					},
				},
				env,
				ctx,
			),
		);
		expect(submitted.type).toBe(5);
		await waitOnExecutionContext(ctx);

		const reputation = await getReporterReputation(env, 'duplicate-reporter');
		expect(reputation.submittedReports).toBe(1);
		expect(reputation.acceptedReports).toBe(1);
		const accepted = await getAcceptedReport(env, '808');
		expect(accepted?.duplicateReports).toEqual([expect.objectContaining({ reporterId: 'duplicate-reporter' })]);
	});

	it('credits a duplicate reporter once when the ban watcher confirms a ban', async () => {
		const env = botEnv({ DISCORD_TOKEN: 'test-token' });
		await putPendingReport(env, {
			id: 'primary-ban-report',
			reporterId: 'primary-reporter',
			targetPlayerId: '909',
			targetName: 'Banned Player',
			reason: 'Cheating',
			status: 'accepted',
			createdAt: '2026-08-14T10:00:00.000Z',
		});
		await putPendingReport(env, {
			id: 'duplicate-ban-report',
			reporterId: 'duplicate-ban-reporter',
			targetPlayerId: '909',
			targetName: 'Banned Player',
			reason: 'Cheating',
			status: 'accepted',
			createdAt: '2026-08-14T11:00:00.000Z',
		});
		await putAcceptedReport(env, {
			reportId: 'primary-ban-report',
			playerId: '909',
			playerName: 'Banned Player',
			reason: 'Cheating',
			reporterId: 'primary-reporter',
			acceptedBy: 'reviewer-1',
			acceptedAt: '2026-08-14T12:00:00.000Z',
			duplicateReports: [
				{
					reportId: 'duplicate-ban-report',
					reporterId: 'duplicate-ban-reporter',
					submittedAt: '2026-08-14T11:00:00.000Z',
				},
			],
		});
		stubProfileAndDiscord({
			basicInfo: { userID: 909, name: 'Banned Player', playerLevel: { level: 50 } },
			stats: { seasonal_stats: [], ranked: { mmr: 1500, rank: 5 } },
			ban: { active: true },
		});

		const result = await runBanWatcher(env, new Date('2026-08-15T12:00:00.000Z'));

		expect(result.banned).toBe(1);
		expect((await getReporterReputation(env, 'primary-reporter')).banConfirmedReports).toBe(1);
		expect((await getReporterReputation(env, 'duplicate-ban-reporter')).banConfirmedReports).toBe(1);
		expect((await getPendingReport(env, 'duplicate-ban-report'))?.status).toBe('ban_confirmed');
	});
});
