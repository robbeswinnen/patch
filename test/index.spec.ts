import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
} from "cloudflare:test";
import { afterEach, describe, it, expect, vi } from "vitest";
import worker, {
	DISCORD_COMMANDS,
	buildClanEmbeds,
	buildCompareEmbed,
	buildStatsEmbeds,
	handleInteraction,
	type Env,
} from "../src/index";
import { runBanWatcher } from "../src/lib/ban-watcher";
import { buildPlayerCardSvg } from "../src/lib/card-image";
import { commandPromotionEmbed } from "../src/lib/promotions";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

function sampleProfile(name = "NobilisPugnam", mmr = 1661, userID = 173910090) {
	return {
		basicInfo: {
			userID,
			name,
			playerLevel: {
				level: 88,
			},
		},
		ban: null,
		clan: {
			basicInfo: {
				name: "DangerDeath",
				tag: "th7",
			},
			memberRank: 40,
		},
		stats: {
			seasonal_stats: [
				{
					season: 16,
					ranked: { k: 10, d: 5, a: 2, w: 3, l: 1 },
					casual: { k: 8, d: 4, a: 1, w: 2, l: 0 },
					custom: { k: 2, d: 1, a: 0, w: 0, l: 0 },
				},
				{
					season: 17,
					ranked: { k: 20, d: 10, a: 5, w: 4, l: 2 },
					casual: { k: 12, d: 8, a: 2, w: 1, l: 1 },
					custom: { k: 3, d: 0, a: 1, w: 0, l: 0 },
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

function jsonResponse(data: unknown) {
	return new Response(JSON.stringify(data), {
		headers: {
			"Content-Type": "application/json",
		},
	});
}

function containsByteSequence(bytes: Uint8Array, sequence: number[]) {
	for (let index = 0; index <= bytes.length - sequence.length; index += 1) {
		if (sequence.every((byte, offset) => bytes[index + offset] === byte)) {
			return true;
		}
	}

	return false;
}

function mockEnv(initialData: Record<string, unknown> = {}) {
	const store = new Map<string, string>();
	for (const [key, value] of Object.entries(initialData)) {
		store.set(key, typeof value === "string" ? value : JSON.stringify(value));
	}

	return {
		DISCORD_PUBLIC_KEY: "test",
		DISCORD_BOT_TOKEN: "test-token",
		DISCORD_APPLICATION_ID: "app-id",
		SUPPORT_REPORT_CHANNEL_ID: "support-channel-id",
		USER_PREFERENCES: {
			get: vi.fn((key: string, type?: string) => {
				const value = store.get(key) ?? null;
				if (type === "json") {
					return Promise.resolve(value ? JSON.parse(value) : null);
				}
				return Promise.resolve(value);
			}),
			put: vi.fn((key: string, value: string) => {
				store.set(key, value);
				return Promise.resolve();
			}),
			delete: vi.fn((key: string) => {
				store.delete(key);
				return Promise.resolve();
			}),
			list: vi.fn(({ prefix }: { prefix?: string; cursor?: string } = {}) => {
				return Promise.resolve({
					keys: Array.from(store.keys())
						.filter((key) => !prefix || key.startsWith(prefix))
						.map((name) => ({ name })),
					list_complete: true,
					cursor: undefined,
				});
			}),
		},
		__store: store,
	} as unknown as Env & { __store: Map<string, string> };
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe("Discord interaction worker", () => {
	it("registers user-installable commands without configure or image mode", () => {
		expect(DISCORD_COMMANDS.map((command) => command.name)).toEqual([
			"help",
			"stats",
			"profile",
			"compare",
			"clan",
			"track",
			"tags",
			"report",
		]);

		for (const command of DISCORD_COMMANDS) {
			expect(command.integration_types).toEqual([0, 1]);
			expect(command.contexts).toEqual([0, 1, 2]);
		}
	});

	it("does not expose the removed test playground command", async () => {
		const response = await handleInteraction(
			{
				type: 2,
				user: { id: "developer-id" },
				data: {
					name: "test",
				},
			},
			mockEnv()
		);

		await expect(response.json()).resolves.toMatchObject({
			type: 4,
			data: { content: "That command is not on Patch's board yet. Try `/help` for the menu." },
		});
	});

	it("builds rare profile promos and higher-chance report appeal promos", () => {
		const env = mockEnv();
		const profilePromo = commandPromotionEmbed({
			commandName: "help",
			env,
			interaction: {
				id: "promo-1",
				type: 2,
				user: { id: "user" },
			},
		});
		const appealPromo = commandPromotionEmbed({
			commandName: "stats",
			env,
			interaction: {
				id: "appeal-1",
				type: 2,
				user: { id: "user" },
			},
			report: {
				reportId: "report-1",
				playerId: "173910090",
				playerName: "NobilisPugnam",
				reason: "Accepted report",
				reporterId: "reporter",
			},
		});

		expect(profilePromo?.description).toContain("/profile player:<name-or-id>");
		expect(appealPromo?.title).toBe("Appeal route");
		expect(appealPromo?.description).toContain("create a ticket");
	});

	it("rejects non-POST requests", async () => {
		const request = new IncomingRequest("http://example.com");
		const ctx = createExecutionContext();
		const response = await worker.fetch(
			request,
			{ ...env, DISCORD_PUBLIC_KEY: "test" } as Env,
			ctx
		);

		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(405);
		expect(await response.text()).toBe(
			"This Discord bot only accepts POST requests."
		);
	});

	it("responds with a clean help embed", async () => {
		const response = await handleInteraction(
			{
				type: 2,
				data: {
					name: "help",
				},
			},
			mockEnv()
		);
		const body = (await response.json()) as {
			type: number;
			data: {
				embeds: Array<{
					title: string;
					description?: string;
					image?: { url: string };
					fields?: Array<{ name: string; value: string }>;
				}>;
			};
		};

		expect(body.type).toBe(4);
		expect(body.data.embeds[0].title).toBe("Patch Help");
		expect(body.data.embeds[0].description).toContain("## Patch command desk");
		expect(body.data.embeds[0].fields?.[0].value).toContain("`/stats`");
		expect(body.data.embeds[0].fields?.[2].value).toContain("@reckiscool");
		expect(body.data.embeds[0].image?.url).toMatch(/^https?:\/\//);
	});

	it("explains public account tags", async () => {
		const response = await handleInteraction(
			{
				type: 2,
				data: {
					name: "tags",
				},
			},
			mockEnv()
		);
		const body = (await response.json()) as {
			type: number;
			data: { embeds: Array<{ title: string; description?: string; image?: { url: string } }> };
		};

		expect(body.type).toBe(4);
		expect(body.data.embeds[0].title).toBe("Patch Account Tags");
		expect(body.data.embeds[0].image?.url).toBe("https://i.imgur.com/riz1PbK.jpg");
		expect(body.data.embeds[0].description).toContain("**Secure**");
		expect(body.data.embeds[0].description).toContain("**Community report**");
		expect(body.data.embeds[0].description).toContain("**Verified**");
		expect(body.data.embeds[0].description).toContain("Content creator");
		expect(body.data.embeds[0].description).toContain("support server");
		expect(body.data.embeds[0].description).not.toContain("Lucide");
	});

	it("looks up players and returns the profile stats page first with a page menu", async () => {
		let editPayload: {
			embeds?: Array<{ title: string; image?: { url: string } }>;
			components?: unknown[];
		} = {};
		const fetchProfile = vi
			.spyOn(globalThis, "fetch")
			.mockImplementation(async (input, init) => {
				const url = String(input);
				if (url.includes("/api/public/profile")) {
					return jsonResponse([sampleProfile()]);
				}
				if (url.includes("/webhooks/app-id/interaction-token/messages/@original")) {
					editPayload = JSON.parse(String(init?.body));
					return jsonResponse({ id: "original-message" });
				}
				throw new Error(`Unexpected fetch: ${url}`);
			});
		const ctx = createExecutionContext();

		const response = await handleInteraction(
			{
				id: "interaction-id",
				token: "interaction-token",
				type: 2,
				user: { id: "discord-user-1", username: "Requester" },
				data: {
					name: "stats",
					options: [{ name: "player", value: "NobilisPugnam" }],
				},
			},
			mockEnv(),
			ctx
		);
		const body = (await response.json()) as {
			type: number;
			data: Record<string, never>;
		};

		expect(body).toEqual({ type: 5, data: {} });

		await waitOnExecutionContext(ctx);

		expect(fetchProfile).toHaveBeenCalledWith(
			"https://default.prod.copsapi.criticalforce.fi/api/public/profile?usernames=NobilisPugnam",
			expect.any(Object)
		);
		expect(editPayload.embeds).toHaveLength(1);
		expect(editPayload.embeds?.[0].title).toBe("NobilisPugnam overview");
		expect(editPayload.embeds?.[0].image?.url).toMatch(/^https?:\/\//);
		expect(editPayload.components).toHaveLength(1);
	});

	it("acknowledges profile cards immediately and edits in a PNG attachment", async () => {
		let editBody = "";
		let editBytes = new Uint8Array();
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockImplementation(async (input, init) => {
				const url = String(input);
				if (url.includes("/api/public/profile")) {
					return jsonResponse([sampleProfile()]);
				}
				if (url.includes("/webhooks/app-id/interaction-token/messages/@original")) {
					editBytes = new Uint8Array(await (init?.body as Blob).arrayBuffer());
					editBody = new TextDecoder().decode(editBytes);
					return jsonResponse({ id: "original-message" });
				}
				throw new Error(`Unexpected fetch: ${url}`);
			});
		const ctx = createExecutionContext();

		const response = await handleInteraction(
			{
				id: "interaction-id",
				token: "interaction-token",
				type: 2,
				user: { id: "discord-user-1", username: "Requester" },
				data: {
					name: "profile",
					options: [{ name: "player", value: "NobilisPugnam" }],
				},
			},
			mockEnv(),
			ctx
		);
		const body = (await response.json()) as {
			type: number;
			data: { content: string };
		};

		expect(body).toEqual({
			type: 5,
			data: {},
		});

		await waitOnExecutionContext(ctx);

		expect(fetchMock).toHaveBeenCalledWith(
			"https://discord.com/api/v10/webhooks/app-id/interaction-token/messages/@original",
			expect.objectContaining({ method: "PATCH" })
		);
		expect(editBody).toContain('"filename":"nobilispugnam-card.png"');
		expect(editBody).toContain("Content-Type: image/png");
		expect(containsByteSequence(editBytes, [137, 80, 78, 71, 13, 10, 26, 10])).toBe(
			true
		);
	});

	it("updates stats pages from the select menu", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse([sampleProfile()]));

		const response = await handleInteraction(
			{
				type: 3,
				data: {
					custom_id: "stats_page:173910090",
					values: ["1"],
				},
			},
			mockEnv()
		);
		const body = (await response.json()) as {
			type: number;
			data: { embeds: Array<{ title: string }> };
		};

		expect(body.type).toBe(7);
		expect(body.data.embeds[0].title).toBe("NobilisPugnam season stats");
	});

	it("looks up clans and returns the overview page first with a page menu", async () => {
		let editPayload: {
			embeds?: Array<{ title: string; image?: { url: string } }>;
			components?: unknown[];
		} = {};
		vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
			const url = String(input);
			if (url.includes("/api/leaderboard/clan")) {
				return jsonResponse([
					{
						name: "DangerDeath",
						tag: "th7",
						rating: 32000,
						players: 19,
						average_rating: 1684.2,
						kills: 1000,
						deaths: 800,
						kdr: 1.25,
						assists: 200,
						wins: 80,
						losses: 40,
						wlr: 2,
						rank: 12,
					},
				]);
			}
			if (url.includes("/webhooks/app-id/clan-token/messages/@original")) {
				editPayload = JSON.parse(String(init?.body));
				return jsonResponse({ id: "original-message" });
			}
			throw new Error(`Unexpected fetch: ${url}`);
		});
		const ctx = createExecutionContext();

		const response = await handleInteraction(
			{
				id: "interaction-id",
				token: "clan-token",
				type: 2,
				data: {
					name: "clan",
					options: [{ name: "query", value: "th7" }],
				},
			},
			mockEnv(),
			ctx
		);
		const body = (await response.json()) as {
			type: number;
			data: Record<string, never>;
		};

		expect(body).toEqual({ type: 5, data: {} });

		await waitOnExecutionContext(ctx);

		expect(editPayload.embeds).toHaveLength(1);
		expect(editPayload.embeds?.[0].title).toBe("DangerDeath [th7]");
		expect(editPayload.embeds?.[0].image?.url).toMatch(/^https?:\/\//);
		expect(editPayload.components).toHaveLength(1);
	});

	it("compares two players with skill-focused metrics", async () => {
		let editPayload: {
			embeds?: Array<{ title: string; description?: string; image?: { url: string } }>;
		} = {};
		vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
			const url = String(input);
			if (url.includes("usernames=PlayerOne")) {
				return jsonResponse([sampleProfile("PlayerOne", 1661, 111)]);
			}
			if (url.includes("usernames=PlayerTwo")) {
				return jsonResponse([sampleProfile("PlayerTwo", 1750, 222)]);
			}
			if (url.includes("/webhooks/app-id/compare-token/messages/@original")) {
				editPayload = JSON.parse(String(init?.body));
				return jsonResponse({ id: "original-message" });
			}
			throw new Error(`Unexpected fetch: ${url}`);
		});
		const ctx = createExecutionContext();

		const response = await handleInteraction(
			{
				id: "interaction-id",
				token: "compare-token",
				type: 2,
				data: {
					name: "compare",
					options: [
						{ name: "player1", value: "PlayerOne" },
						{ name: "player2", value: "PlayerTwo" },
					],
				},
			},
			mockEnv(),
			ctx
		);
		const body = (await response.json()) as {
			type: number;
			data: Record<string, never>;
		};

		expect(body).toEqual({ type: 5, data: {} });

		await waitOnExecutionContext(ctx);

		expect(editPayload.embeds?.[0].title).toBe("PlayerOne vs PlayerTwo");
		expect(editPayload.embeds?.[0].description).toContain("friendly server debates");
		expect(editPayload.embeds?.[0].image?.url).toMatch(/^https?:\/\//);
	});

	it("builds clean stats embeds with report status", async () => {
		const env = mockEnv({
			"report:accepted:173910090": {
				reportId: "report-1",
				playerId: "173910090",
				playerName: "NobilisPugnam",
				reason: "Repeated low-impact ranked performance",
				reporterId: "reporter",
			},
		});
		const embeds = await buildStatsEmbeds(sampleProfile(), env);
		const report = embeds[0].fields?.find((field) => field.name === "Public status");
		const account = embeds[0].fields?.find((field) => field.name === "Account");
		const seasonRanked = embeds[1].fields?.find(
			(field) => field.name === "Ranked"
		);
		const allTimeRanked = embeds[2].fields?.find(
			(field) => field.name === "Ranked"
		);

		expect(embeds).toHaveLength(3);
		expect(embeds[0].description).toContain("> - ID: `173910090`");
		expect(account?.value).toContain(
			"> - Account appears to have been created around Season 16"
		);
		expect(report?.value).toContain("Public reason: **Repeated low-impact ranked performance**");
		expect(seasonRanked?.value).toContain("K/D/A: 20 / 10 / 5");
		expect(allTimeRanked?.value).toContain("K/D/A: 30 / 15 / 7");
		expect(allTimeRanked?.value).toContain("Win rate: 70.0%");
	});

	it("builds stats embeds and profile cards with curated tags", async () => {
		const env = mockEnv({
			"player:tags:173910090": {
				playerId: "173910090",
				playerName: "NobilisPugnam",
				tags: ["creator", "verified"],
				updatedAt: new Date().toISOString(),
				updatedBy: "developer-id",
			},
		});
		const embeds = await buildStatsEmbeds(sampleProfile(), env);
		const status = embeds[0].fields?.find((field) => field.name === "Public status");
		const svg = buildPlayerCardSvg(sampleProfile(), "Patch", undefined, [
			"creator",
			"verified",
		]);

		expect(embeds[0].color).toBe(0xf6c945);
		expect(status?.value).toContain("Community status: **Verified, Creator**");
		expect(status?.value).toContain("Verified: Known and trusted");
		expect(status?.value).toContain("Creator: Content creator");
		expect(svg).toContain("VERIFIED");
		expect(svg).toContain("CREATOR");
		expect(svg).toContain("#f6c945");
	});

	it("adds an identity-side banned tag without taking over the footer status", () => {
		const cleanSvg = buildPlayerCardSvg(sampleProfile());
		const bannedSvg = buildPlayerCardSvg({
			...sampleProfile(),
			ban: {
				permanent: true,
				reason: "Game ban",
			},
		});
		const bannedReportedSvg = buildPlayerCardSvg(
			{
				...sampleProfile(),
				ban: {
					permanent: true,
					reason: "Game ban",
				},
			},
			"Patch",
			{
				reportId: "report-1",
				playerId: "173910090",
				playerName: "NobilisPugnam",
				reason: "Boosting",
				reporterId: "reporter",
			}
		);

		expect(cleanSvg).not.toContain("BANNED");
		expect(bannedSvg).toContain("BANNED");
		expect(bannedSvg).toContain("IN-GAME");
		expect(bannedSvg).toContain('fill="url(#ban-glow)"');
		expect(bannedSvg).toContain("SECURE");
		expect(bannedReportedSvg).toContain("BANNED");
		expect(bannedReportedSvg).toContain("COMMUNITY REPORT");
		expect(bannedReportedSvg).toContain("BOOSTING");
		expect(bannedSvg).not.toContain('clip-path="url(#card-clip)"');
		expect(bannedSvg).not.toContain('opacity="0.075"');
	});

	it("uses rotating profile card metadata instead of unreliable last-online data", () => {
		const profile = sampleProfile();
		const random = vi.spyOn(Math, "random").mockReturnValue(0.25);
		const supportSvg = buildPlayerCardSvg({
			...profile,
			basicInfo: {
				...profile.basicInfo,
				lastSeenTime: "2026-05-14T17:12:00.000Z",
			},
		});
		random.mockReturnValue(0.75);
		const creditSvg = buildPlayerCardSvg(profile);

		expect(supportSvg).toContain("SUPPORT");
		expect(supportSvg).toContain("discord.gg/QW7CZczhT4");
		expect(creditSvg).toContain("MADE BY @xepp._. / @reckiscool / @yoshika._.");
		expect(supportSvg).not.toContain("LAST ONLINE");
		expect(supportSvg).not.toContain("MAY 14 2026 17:12 UTC");
		expect(supportSvg).not.toContain("/profile player:");
	});

	it("shows lookup counts in the identity metadata panel", () => {
		const svg = buildPlayerCardSvg(sampleProfile(), "Patch", undefined, [], 128);

		expect(svg).toContain("100+");
		expect(svg).toContain("LOOKUPS");
		expect(svg).toContain('<rect x="1182" y="250" width="154" height="92"');
	});

	it("builds comparison and clan embeds directly", () => {
		const comparison = buildCompareEmbed(
			sampleProfile("PlayerOne", 1661),
			sampleProfile("PlayerTwo", 1750)
		);
		const clanEmbeds = buildClanEmbeds({
			name: "DangerDeath",
			tag: "th7",
			rating: 32000,
			players: 19,
			average_rating: 1684.2,
			kills: 1000,
			deaths: 800,
			kdr: 1.25,
			assists: 200,
			wins: 80,
			losses: 40,
			wlr: 2,
			rank: 12,
		});

		expect(comparison.title).toBe("PlayerOne vs PlayerTwo");
		expect(comparison.description).toContain("Patch checks ranked rates");
		expect(comparison.image?.url).toMatch(/^https?:\/\//);
		expect(clanEmbeds[0].title).toBe("DangerDeath [th7]");
		expect(clanEmbeds[0].image?.url).toMatch(/^https?:\/\//);
		expect(clanEmbeds[1].title).toBe("DangerDeath [th7] performance");
	});

	it("tracks multiple ranked players for one Discord user", async () => {
		const env = mockEnv();
		vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
			const url = String(input);
			if (url.includes("usernames=PlayerOne")) {
				return jsonResponse([sampleProfile("PlayerOne", 1661, 111)]);
			}
			if (url.includes("usernames=PlayerTwo")) {
				return jsonResponse([sampleProfile("PlayerTwo", 1750, 222)]);
			}
			if (url.includes("/webhooks/app-id/")) {
				return jsonResponse({ id: "original-message" });
			}
			throw new Error(`Unexpected fetch: ${url}`);
		});
		const ctxOne = createExecutionContext();

		await handleInteraction(
			{
				id: "interaction-id-1",
				token: "track-token-1",
				type: 2,
				user: { id: "discord-user-1" },
				data: {
					name: "track",
					options: [{ name: "player", value: "PlayerOne" }],
				},
			},
			env,
			ctxOne
		);
		await waitOnExecutionContext(ctxOne);

		const ctxTwo = createExecutionContext();
		await handleInteraction(
			{
				id: "interaction-id-2",
				token: "track-token-2",
				type: 2,
				user: { id: "discord-user-1" },
				data: {
					name: "track",
					options: [{ name: "player", value: "PlayerTwo" }],
				},
			},
			env,
			ctxTwo
		);
		await waitOnExecutionContext(ctxTwo);

		const stored = JSON.parse(env.__store.get("track:discord-user-1") || "{}");
		expect(stored.players).toHaveLength(2);
		expect(stored.players.map((player: { label: string }) => player.label)).toEqual([
			"PlayerOne",
			"PlayerTwo",
		]);
	});

	it("manages accepted reports and report blacklists with dev tools", async () => {
		const env = mockEnv({
			"report:accepted:173910090": {
				reportId: "report-1",
				playerId: "173910090",
				playerName: "NobilisPugnam",
				reason: "Cheating",
				reporterId: "reporter",
			},
		}) as Env & { DEVELOPER_DISCORD_USER_ID: string; __store: Map<string, string> };
		env.DEVELOPER_DISCORD_USER_ID = "developer-id";

		const denied = await handleInteraction(
			{
				type: 2,
				user: { id: "someone-else" },
				data: {
					name: "dev",
					options: [
						{
							name: "remove-report",
							type: 1,
							options: [{ name: "player", value: "NobilisPugnam" }],
						},
					],
				},
			},
			env
		);
		await expect(denied.json()).resolves.toMatchObject({
			type: 4,
			data: { content: "That one is for the Patch dev seat.", flags: 64 },
		});

		vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
			const url = String(input);
			if (url.includes("/api/public/profile")) {
				return jsonResponse([sampleProfile()]);
			}
			throw new Error(`Unexpected fetch: ${url}`);
		});

		const removed = await handleInteraction(
			{
				type: 2,
				user: { id: "developer-id" },
				data: {
					name: "dev",
					options: [
						{
							name: "remove-report",
							type: 1,
							options: [{ name: "player", value: "NobilisPugnam" }],
						},
					],
				},
			},
			env
		);
		await expect(removed.json()).resolves.toMatchObject({
			type: 4,
			data: { flags: 64 },
		});
		expect(env.__store.has("report:accepted:173910090")).toBe(false);

		const tagged = await handleInteraction(
			{
				type: 2,
				user: { id: "developer-id" },
				data: {
					name: "dev",
					options: [
						{
							name: "tag",
							type: 1,
							options: [
								{ name: "player", value: "NobilisPugnam" },
								{ name: "action", value: "add" },
								{ name: "tag", value: "verified" },
							],
						},
					],
				},
			},
			env
		);
		await expect(tagged.json()).resolves.toMatchObject({
			type: 4,
			data: { flags: 64 },
		});
		const tagRecord = JSON.parse(env.__store.get("player:tags:173910090") || "{}");
		expect(tagRecord.tags).toEqual(["verified"]);

		const untagged = await handleInteraction(
			{
				type: 2,
				user: { id: "developer-id" },
				data: {
					name: "dev",
					options: [
						{
							name: "tag",
							type: 1,
							options: [
								{ name: "player", value: "NobilisPugnam" },
								{ name: "action", value: "remove" },
								{ name: "tag", value: "all" },
							],
						},
					],
				},
			},
			env
		);
		await expect(untagged.json()).resolves.toMatchObject({
			type: 4,
			data: { flags: 64 },
		});
		expect(env.__store.has("player:tags:173910090")).toBe(false);

		const blacklisted = await handleInteraction(
			{
				type: 2,
				user: { id: "developer-id" },
				data: {
					name: "dev",
					options: [
						{
							name: "report-blacklist",
							type: 1,
							options: [
								{ name: "user", value: "111222333444555666" },
								{ name: "action", value: "add" },
								{ name: "reason", value: "Spam reporting" },
							],
						},
					],
				},
			},
			env
		);
		await expect(blacklisted.json()).resolves.toMatchObject({
			type: 4,
			data: { flags: 64 },
		});
		expect(env.__store.has("report:blacklist:111222333444555666")).toBe(true);

		const unblacklisted = await handleInteraction(
			{
				type: 2,
				user: { id: "developer-id" },
				data: {
					name: "dev",
					options: [
						{
							name: "report-blacklist",
							type: 1,
							options: [
								{ name: "user", value: "111222333444555666" },
								{ name: "action", value: "remove" },
							],
						},
					],
				},
			},
			env
		);
		await expect(unblacklisted.json()).resolves.toMatchObject({
			type: 4,
			data: { flags: 64 },
		});
		expect(env.__store.has("report:blacklist:111222333444555666")).toBe(false);
	});

	it("submits proof-backed reports through modals and accepts a final public reason", async () => {
		const env = mockEnv();
		env.DISCORD_TOKEN = env.DISCORD_BOT_TOKEN;
		env.DISCORD_BOT_TOKEN = undefined;

		const modalResponse = await handleInteraction(
			{
				id: "interaction-id",
				token: "report-token",
				type: 2,
				user: { id: "reporter-id" },
				data: {
					name: "report",
					options: [
						{ name: "player", value: "ReportedPlayer" },
						{ name: "proof", value: "proof-1" },
					],
					resolved: {
						attachments: {
							"proof-1": {
								id: "proof-1",
								filename: "clip.mp4",
								content_type: "video/mp4",
								size: 1024,
								url: "https://cdn.discordapp.com/attachments/proof/clip.mp4",
							},
						},
					},
				},
			},
			env
		);
		const modalBody = (await modalResponse.json()) as {
			type: number;
			data: { custom_id: string; components: unknown[] };
		};

		expect(modalBody.type).toBe(9);
		expect(modalBody.data.custom_id).toMatch(/^report_submit:/);
		expect(modalBody.data.components).toHaveLength(2);

		const draftKey = Array.from(env.__store.keys()).find((key) =>
			key.startsWith("report:draft:")
		);
		expect(draftKey).toBeTruthy();
		const draftId = draftKey!.replace("report:draft:", "");

		const fetchMock = vi.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(jsonResponse([sampleProfile("ReportedPlayer", 1661)]))
			.mockResolvedValueOnce(jsonResponse({ id: "support-message" }))
			.mockResolvedValueOnce(jsonResponse({ id: "original-message" }));
		const ctx = createExecutionContext();

		const submitResponse = await handleInteraction(
			{
				id: "modal-interaction-id",
				token: "report-modal-token",
				type: 5,
				user: { id: "reporter-id" },
				data: {
					custom_id: `report_submit:${draftId}`,
					components: [
						{
							type: 18,
							label: "Short reason",
							component: {
								type: 4,
								custom_id: "report_reason",
								value: "Cheating",
							},
						},
						{
							type: 18,
							label: "What happened?",
							component: {
								type: 4,
								custom_id: "report_details",
								value: "The player snapped onto targets through smoke across several rounds.",
							},
						},
					],
				},
			},
			env,
			ctx
		);

		await expect(submitResponse.json()).resolves.toMatchObject({
			type: 5,
			data: { flags: 64 },
		});
		await waitOnExecutionContext(ctx);

		expect(fetchMock).toHaveBeenCalledWith(
			"https://discord.com/api/v10/channels/support-channel-id/messages",
			expect.objectContaining({
				headers: expect.objectContaining({ Authorization: "Bot test-token" }),
				method: "POST",
			})
		);
		const reportKey = Array.from(env.__store.keys()).find((key) =>
			key.startsWith("report:pending:")
		);
		expect(reportKey).toBeTruthy();
		const reportId = reportKey!.replace("report:pending:", "");
		const storedReport = JSON.parse(env.__store.get(reportKey!) || "{}");
		expect(storedReport.reason).toBe("Cheating");
		expect(storedReport.details).toContain("snapped onto targets");
		expect(storedReport.proof.url).toContain("clip.mp4");

		const cooldownResponse = await handleInteraction(
			{
				id: "cooldown-interaction-id",
				token: "cooldown-token",
				type: 2,
				user: { id: "reporter-id" },
				data: {
					name: "report",
					options: [
						{ name: "player", value: "ReportedPlayer" },
						{ name: "proof", value: "proof-1" },
					],
					resolved: {
						attachments: {
							"proof-1": {
								id: "proof-1",
								filename: "clip.mp4",
								content_type: "video/mp4",
								size: 1024,
								url: "https://cdn.discordapp.com/attachments/proof/clip.mp4",
							},
						},
					},
				},
			},
			env
		);
		await expect(cooldownResponse.json()).resolves.toMatchObject({
			type: 4,
			data: {
				flags: 64,
				content: expect.stringContaining("report cannon"),
			},
		});

		const reviewResponse = await handleInteraction(
			{
				type: 3,
				user: { id: "reviewer-id" },
				data: {
					custom_id: `report_accept:${reportId}`,
				},
			},
			env
		);
		const reviewBody = (await reviewResponse.json()) as {
			type: number;
			data: { custom_id: string };
		};

		expect(reviewBody.type).toBe(9);
		expect(reviewBody.data.custom_id).toBe(`report_review:accept:${reportId}`);

		const dmPayloads: Array<{ embeds?: Array<{ title: string; description: string }> }> = [];
		fetchMock.mockImplementation(async (input, init) => {
			const url = String(input);
			if (url.includes("users/@me/channels")) {
				return jsonResponse({ id: "dm-channel-id" });
			}
			if (url.includes("channels/dm-channel-id/messages")) {
				dmPayloads.push(JSON.parse(String(init?.body)));
				return jsonResponse({ id: "dm-message" });
			}
			throw new Error(`Unexpected fetch: ${url}`);
		});
		const reviewCtx = createExecutionContext();

		const acceptedResponse = await handleInteraction(
			{
				type: 5,
				user: { id: "reviewer-id" },
				data: {
					custom_id: `report_review:accept:${reportId}`,
					components: [
						{
							type: 18,
							label: "Public reason",
							component: {
								type: 4,
								custom_id: "report_public_reason",
								value: "Verified cheating report",
							},
						},
						{
							type: 18,
							label: "Reviewer note",
							component: {
								type: 4,
								custom_id: "report_reviewer_note",
								value: "Clip shows repeated target snapping with enough context to accept.",
							},
						},
					],
				},
			},
			env,
			reviewCtx
		);
		const acceptedBody = (await acceptedResponse.json()) as {
			type: number;
			data: { embeds: Array<{ description: string }> };
		};
		await waitOnExecutionContext(reviewCtx);

		expect(acceptedBody.type).toBe(7);
		expect(acceptedBody.data.embeds[0].description).toContain("Verified cheating report");
		expect(env.__store.has("report:accepted:173910090")).toBe(true);
		const acceptedReport = JSON.parse(env.__store.get("report:accepted:173910090") || "{}");
		expect(acceptedReport.reason).toBe("Verified cheating report");
		expect(dmPayloads[0].embeds?.[0].title).toBe("Report accepted. Good eye.");
		expect(dmPayloads[0].embeds?.[0].description).toContain("ReportedPlayer");
	});

	it("notifies the reporter once an accepted report turns into an in-game ban", async () => {
		const env = mockEnv({
			"report:accepted:999001": {
				reportId: "report-1",
				playerId: "999001",
				playerName: "ReportedPlayer",
				reason: "Verified cheating report",
				reporterId: "reporter-id",
			},
		});
		const dmPayloads: Array<{ embeds?: Array<{ title: string; description: string }> }> = [];

		vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
			const url = String(input);
			if (url.includes("/api/public/profile")) {
				return jsonResponse([
					{
						...sampleProfile("ReportedPlayer", 1661, 999001),
						ban: {
							permanent: true,
							reason: "Game ban",
						},
					},
				]);
			}
			if (url.includes("users/@me/channels")) {
				return jsonResponse({ id: "dm-channel-id" });
			}
			if (url.includes("channels/dm-channel-id/messages")) {
				dmPayloads.push(JSON.parse(String(init?.body)));
				return jsonResponse({ id: "dm-message" });
			}
			throw new Error(`Unexpected fetch: ${url}`);
		});

		const result = await runBanWatcher(
			env,
			new Date("2026-05-14T18:00:00.000Z")
		);
		const storedReport = JSON.parse(
			env.__store.get("report:accepted:999001") || "{}"
		);

		expect(result).toEqual({
			checked: 1,
			banned: 1,
			notified: 1,
			skipped: 0,
		});
		expect(storedReport.banDetectedAt).toBe("2026-05-14T18:00:00.000Z");
		expect(storedReport.banNotifiedAt).toBe("2026-05-14T18:00:00.000Z");
		expect(dmPayloads[0].embeds?.[0].title).toBe("Bullseye. They got banned.");
		expect(dmPayloads[0].embeds?.[0].description).toContain("Quiet hero work");
	});
});
