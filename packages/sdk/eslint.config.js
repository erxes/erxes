const baseConfig = require('../../eslint.config.js');

module.exports = [
  ...baseConfig,
  // The scaffold is an extension's source, not the SDK's: it imports what an
  // extension imports. `erxes-ext create` output is what gets checked.
  { ignores: ['template/**'] },
];
