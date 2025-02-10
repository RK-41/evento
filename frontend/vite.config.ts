import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		assetsDir: 'assets',
		sourcemap: true,
	},
	server: {
		allowedHosts: [
			'localhost',
			'127.0.0.1',
			'b04c-49-37-72-107.ngrok-free.app',
		],
	},
});
