const nx = require('@nx/eslint-plugin');
const reactHooks = require('eslint-plugin-react-hooks');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/node_modules',
      'apps/client-portal-template/eslint.config.mjs',
      '**/*.bundle.js',
    ],
  },
  {
    linterOptions: { reportUnusedDisableDirectives: 'warn' },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      import: importPlugin,
    },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [
            '^.*/eslint(\\.base)?\\.config\\.[cm]?js$', // Allow ESLint config files
            '^.*/jest\\.config\\.[cm]?js$', // Allow Jest config files
            '^.*/babel\\.config\\.[cm]?js$',
            'backend/core-api',
          ],
          allowCircularSelfDependency: true,
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@radix-ui/*'],
              message:
                'Use erxes-ui components instead of Radix primitives (AGENTS.md rule 1).',
            },
            {
              group: ['../**/*_ui/**', '../**/*_api/**'],
              message:
                'Do not import across plugin boundaries (AGENTS.md rule 8).',
            },
          ],
        },
      ],
    },
  },
  {
    // Standalone apps ship their own shadcn/Radix components; rules 1 and 8 cover plugins.
    files: ['apps/**'],
    rules: { '@typescript-eslint/no-restricted-imports': 'off' },
  },
  {
    files: ['**/*.{ts,tsx,jsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: ['**/src/**/*.{ts,tsx}'],
    ignores: [
      '**/*.spec.*',
      '**/*.test.*',
      '**/*.stories.*',
      '**/*.bundle.js',
      // shadowed by usePostDetail.ts; no tsconfig program includes it
      '**/posts/hooks/usePostDetail.tsx',
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': [
        'warn',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'warn',
    },
  },
  {
    files: ['**/src/**/*.{ts,tsx}'],
    rules: {
      'import/no-default-export': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['**/src/**/*.config.{ts,tsx,js,jsx,mjs,cjs}', '**/*.config.*'],
    rules: { 'import/no-default-export': 'off' },
  },
];
