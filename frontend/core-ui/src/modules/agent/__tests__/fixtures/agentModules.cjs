// Loads the agent UI modules and the installed SDK packages for the spawned
// fixtures, which run outside jest (the `ai` packages are ESM-only).
const { createRequire } = require('node:module');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// Resolve from this file, not the cwd: nx runs jest from frontend/core-ui.
const repo = path.resolve(__dirname, '../../../../../../..');
const serviceRequire = createRequire(
  path.join(repo, 'backend/core-api/package.json'),
);
const rootRequire = createRequire(path.join(repo, 'package.json'));

/** Imports an installed package the way core-api resolves it. */
const load = (name) =>
  import(serviceRequire.resolve(name).replace(/\.cjs$/, '.js'));

/**
 * Bundles `source` (ES exports from repository-relative agent modules) with
 * the installed `ai` package and a stub `erxes-ui`, then imports it.
 */
const importAgentModules = async (source) => {
  const built = await rootRequire('esbuild').build({
    stdin: { contents: source, resolveDir: repo },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    packages: 'external',
    plugins: [
      {
        name: 'fixture',
        setup(build) {
          build.onResolve({ filter: /^ai$/ }, () => ({
            path: pathToFileURL(
              serviceRequire.resolve('ai').replace(/\.cjs$/, '.js'),
            ).href,
            external: true,
          }));
          build.onResolve({ filter: /^erxes-ui$/ }, () => ({
            path: 'env',
            namespace: 'fixture',
          }));
          build.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({
            contents: `export const REACT_APP_API_URL='http://fixture';`,
            loader: 'js',
          }));
        },
      },
    ],
  });

  return import(
    'data:text/javascript;base64,' +
      Buffer.from(built.outputFiles[0].text).toString('base64')
  );
};

module.exports = { importAgentModules, load };
