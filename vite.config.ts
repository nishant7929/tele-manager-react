import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const isProduction = process.env.NODE_ENV === 'production';
export default defineConfig({
	plugins: [
		react(),
		...(isProduction ? [nodePolyfills()] : []), // Use only in production
	],
	resolve: {
		alias: {
			process: 'process/browser',
			stream: 'stream-browserify',
			crypto: 'crypto-browserify',
			buffer: 'buffer',
			os: 'os-browserify/browser',
		},
	},
	optimizeDeps: {
		esbuildOptions: {
			define: {
				global: 'globalThis',
			},
			plugins: [
				NodeGlobalsPolyfillPlugin({
					process: true,
					buffer: true,
				}),
			],
		},
	},
	// define: {
	// 	'process.env': {
	// 		...process.env,
	// 	},
	// },
});
