const path = require('path');

const {
  override,
  addBabelPlugins,
  removeModuleScopePlugin,
  babelInclude,
  babelExclude,
} = require("customize-cra");

module.exports = override(
  babelExclude([
    path.resolve("src/__tests__")
  ]),
  babelInclude([
    path.resolve("src"),
    path.resolve("../plugins"),
  ]),
  addBabelPlugins(
    "@babel/plugin-proposal-class-properties",
  ),
  removeModuleScopePlugin(),
);
