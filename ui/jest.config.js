module.exports = {
  preset: "ts-jest",
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.tsx$": "ts-jest"
  },
   // If you want to use testRegex instead in your configuration, you MUST set testMatch to null or Jest will bail.
  testMatch: null,
  testRegex: "/__tests__/.*\\.(ts|js|tsx)$",
  testEnvironment: "jsdom",
  moduleFileExtensions: ["ts", "js", "json", "node", "tsx"],
  modulePaths: ["<rootDir>/src"],
  globals: {
    "ts-jest": {
      tsConfigFile: "tsconfig.jest.json"
    },
    // without it, compilation error occurs in apolloClient
    "fetch": {}
  },
  setupFilesAfterEnv: ["./src/setupTests.ts"],
};
