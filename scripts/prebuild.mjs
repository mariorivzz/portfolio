/**
 * prebuild.mjs
 * Resets wrangler.jsonc to the build-phase config BEFORE `astro build` runs.
 * The @cloudflare/vite-plugin reads wrangler.jsonc during the Vite config phase
 * and requires `main` to point to a resolvable package, not the dist output.
 * Without this script, a fresh CI clone would fail to build because the
 * postbuild-committed wrangler.jsonc references ./dist/server/entry.mjs which
 * doesn't exist yet.
 */
import { writeFileSync } from 'fs';

const config = {
	compatibility_date: '2026-05-08',
	compatibility_flags: ['global_fetch_strictly_public'],
	name: 'digital-disk',
	main: '@astrojs/cloudflare/entrypoints/server',
	assets: {
		directory: './dist',
		binding: 'ASSETS',
	},
	observability: {
		enabled: true,
	},
};

writeFileSync('wrangler.jsonc', JSON.stringify(config, null, '\t') + '\n');
console.log('✔ wrangler.jsonc reset for build phase');
