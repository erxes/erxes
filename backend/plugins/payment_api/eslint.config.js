const baseConfig = require('../../../eslint.config.js');

module.exports = [
  {
    // Standalone Vite widget with its own eslint.config.js toolchain.
    ignores: ['src/widget/**'],
  },
  ...baseConfig,
];
