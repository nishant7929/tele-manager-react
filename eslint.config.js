import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['dist'],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parser,
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      '@typescript-eslint': tseslint,
      'react-refresh': reactRefresh,
    },
    rules: {
	'react/jsx-uses-react': 'off',
	'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'indent': ['warn', 'tab', { SwitchCase: 1 }],
      'quotes': ['error', 'single'],
      'semi': ['warn', 'always'],
      'comma-spacing': ['warn', { before: false, after: true }],
      'no-var': 'warn',
    //   'no-console': 'warn',
      'no-unused-vars': ['warn', { "argsIgnorePattern": "^__" }],
      'camelcase': ['error', { properties: 'never' }],
      'init-declarations': ['warn', 'always'],
      'space-before-function-paren': ['error', 'never'],
      'keyword-spacing': ['error', { before: true, after: true }],
      'arrow-spacing': ['error', { before: true, after: true }],
      'react/jsx-tag-spacing': ['error', {
        closingSlash: 'never',
        beforeSelfClosing: 'always',
        afterOpening: 'never',
        beforeClosing: 'allow',
      }],
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always', { objectsInObjects: false }],
      'linebreak-style': 'off',
      'react/destructuring-assignment': ['error', 'always'],
      'no-useless-escape': 'off',
      'no-unreachable': 'off',
    //   ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
    settings: {
      'import/resolver': {
        typescript: {},
      },
      react: {
        version: 'detect',
      },
	  'react/jsx-runtime': true,
    },
  },
];
