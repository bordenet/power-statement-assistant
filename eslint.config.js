import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest
            }
        },
        rules: {
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'semi': ['error', 'always'],
            'quotes': ['error', 'single', { avoidEscape: true }],
            'indent': ['error', 4],
            'comma-dangle': ['error', 'never'],
            'no-trailing-spaces': 'error',
            'eol-last': ['error', 'always'],
            'object-curly-spacing': ['error', 'always'],
            'array-bracket-spacing': ['error', 'never'],
            'space-before-function-paren': ['error', {
                anonymous: 'never',
                named: 'never',
                asyncArrow: 'always'
            }]
        }
    },
    {
        ignores: [
            'node_modules/**',
            'coverage/**',
            'dist/**',
            'build/**',
            '.git/**'
        ]
    }
];

