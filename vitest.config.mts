import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		cloudflareTest({
			remoteBindings: false,
			wrangler: { configPath: './wrangler.jsonc' },
			// Tests must never proxy writes into the production KV namespace.
			miniflare: { kvNamespaces: ['USER_PREFERENCES'] },
		}),
	],
});
