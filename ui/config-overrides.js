const path = require('path');

const {
  override,
  addBabelPlugins,
  addExternalBabelPlugins,
  removeModuleScopePlugin,
  babelInclude,
} = require("customize-cra");

module.exports = override(
  babelInclude([
    path.resolve("src"),
    path.resolve("../plugins"),
  ]),
  addBabelPlugins(
    "@babel/plugin-proposal-class-properties",
  ),
  addExternalBabelPlugins(
    "@babel/plugin-proposal-nullish-coalescing-operator"
  ),
  removeModuleScopePlugin(),
);
