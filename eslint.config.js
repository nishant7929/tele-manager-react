// @ts-check

import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.recommended,
	prettierConfig,
	{
		// config with just ignores is the replacement for `.eslintignore`
		ignores: ['**/build/**', '**/dist/**'],
	},
	{
		plugins: {
			prettier: prettierPlugin,
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			quotes: ['error', 'single', { avoidEscape: true }],
			semi: ['error', 'always'],
			'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
			// 'prettier/prettier': ['error', { useTabs: true, tabWidth: 2 }],
			'react-hooks/exhaustive-deps': 'off',
			'no-console': ['warn'],
			'no-unused-vars': [
				'error',
				{
					vars: 'all',
					args: 'all',
					ignoreRestSiblings: false,
					argsIgnorePattern: '^_',
				},
			],
			eqeqeq: 'error',
			curly: 'error',
			'no-duplicate-imports': 'error',
		},
	}
);
