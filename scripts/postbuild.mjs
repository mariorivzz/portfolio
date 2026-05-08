/**
 * postbuild.mjs
 * Rewrites wrangler.jsonc after `astro build` so that `wrangler deploy`
 * points to the compiled output (dist/server/entry.mjs) instead of the
 * package entry point used only by the Vite plugin during the build phase.
 */
import { writeFileSync } from 'fs';

const config = {
	compatibility_date: '2026-05-08',
	compatibility_flags: ['global_fetch_strictly_public'],
	name: 'digital-disk',
	main: './dist/server/entry.mjs',
	assets: {
		directory: './dist/client',
		binding: 'ASSETS',
	},
	observability: {
		enabled: true,
	},
};

writeFileSync('wrangler.jsonc', JSON.stringify(config, null, '\t') + '\n');
console.log('✔ wrangler.jsonc updated for deployment');
