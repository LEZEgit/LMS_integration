export default {
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/tests/**/*.test.js"],
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  moduleFileExtensions: ["js"],
  collectCoverageFrom: ["src/**/*.js", "!src/**/index.js", "!src/config/db.js"],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};
