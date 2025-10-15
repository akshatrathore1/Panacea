import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'

const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
    recommendedConfig: js.configs.recommended,
})

const eslintConfig = [
    ...compat.extends('next/core-web-vitals', 'next/typescript'),
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        rules: {
            // Relax some rules for development
            '@typescript-eslint/no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_'
            }],
            '@typescript-eslint/no-explicit-any': 'warn',
            'react-hooks/exhaustive-deps': 'warn',
        },
    },
    {
        ignores: [
            '.next/**',
            'node_modules/**',
            '*.config.js',
            '*.config.ts',
            'contracts/**',
            'scripts/**',
            'artifacts/**',
            'cache/**',
        ],
    },
]

export default eslintConfig