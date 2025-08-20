import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://photos.jaydixit.com',
	vite: {
		plugins: [tailwindcss()],
	},
});
