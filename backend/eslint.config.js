// @ts-check
const tseslint = require('typescript-eslint');

/**
 * ESLint 9 Flat Config
 * - typescript-eslint recommended 규칙 적용
 * - 테스트 파일에서는 일부 규칙 완화
 */
module.exports = tseslint.config(
  // ── 1. typescript-eslint 권장 규칙 ──────────────────────────
  ...tseslint.configs.recommended,

  // ── 2. 프로젝트 공통 규칙 ─────────────────────────────────────
  {
    rules: {
      // any 타입 사용 시 경고 (에러 대신 warn — 점진적 개선 유도)
      '@typescript-eslint/no-explicit-any': 'warn',
      // 사용하지 않는 변수: _접두사 예외 허용
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // console 사용: 백엔드이므로 허용
      'no-console': 'off',
    },
  },

  // ── 3. 테스트 파일 규칙 완화 ──────────────────────────────────
  {
    files: ['src/__tests__/**/*.ts'],
    rules: {
      // 테스트에서는 any 타입 사용 빈번 → 경고 해제
      '@typescript-eslint/no-explicit-any': 'off',
      // 테스트에서 require() mock 패턴 허용
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // ── 4. 제외 경로 ──────────────────────────────────────────────
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'jest.setup.js', 'jest.config.js'],
  }
);
