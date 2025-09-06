import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://astro.build/config
export default defineConfig({
	site: 'https://photos.jaydixit.com',
	integrations: [mdx()],
	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				'~': path.resolve(__dirname, './src'),
			},
		},
	},
});
