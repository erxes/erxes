const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "bg7eun",

  env: {
    userEmail: "admin@erxes.io",
    userPassword: "Admin123@",
  },

  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/tests/**/*.js",
    // supportFile: "cypress/support/e2e.ts",
    // viewportHeight: 1000,
    // viewportWidth: 1280,
    // experimentalRunAllSpecs: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
