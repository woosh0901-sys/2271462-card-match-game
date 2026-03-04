module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    // 단위 테스트: 외부 의존성 없이 순수 로직만 검증
    '**/__tests__/unit/**/*.ts',
    // 통합 테스트: HTTP 레이어 + Express 앱 전체 검증
    '**/__tests__/integration/**/*.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
