import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { rspack } from '@rspack/core';
import { pluginName } from '../names';
import { buildExtensionCss } from './css';
import { exists, SDK_ALIAS } from './paths';

// The erxes host provides these. The remote never bundles its own copy.
const HOST_LIBRARIES = [
  'react',
  'react-dom',
  'react-router',
  'react-router-dom',
  'erxes-ui',
  'ui-modules',
  'jotai',
  '@apollo/client',
  'react-i18next',
  'react-hook-form',
];

const listFiles = async (dir: string, prefix = ''): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? listFiles(path.join(dir, entry.name), `${prefix}${entry.name}/`)
        : [`${prefix}${entry.name}`],
    ),
  );
  return nested.flat();
};

// ui/src/config.tsx as a Module Federation remote named `<pluginName>_ui`,
// exposing only `./config`: its CONFIG carries the components. Returns the
// remote's files as the install body ships them, or undefined without a UI.
export const buildUi = async (extDir: string, id: string) => {
  const entry = path.join(extDir, 'ui/src/config.tsx');

  if (!(await exists(entry))) {
    return undefined;
  }

  // The remote's name in the host, and its chunk-loading global, so two
  // extensions' chunks never overwrite each other in the page.
  const name = `${pluginName(id)}_ui`;
  const outDir = path.join(extDir, 'dist/ui');
  const css = await buildExtensionCss(extDir);
  const compiler = rspack({
    mode: 'production',
    context: extDir,
    entry: {},
    output: {
      path: outDir,
      publicPath: 'auto',
      uniqueName: name,
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: SDK_ALIAS,
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'typescript', tsx: true },
              transform: { react: { runtime: 'automatic' } },
            },
          },
          type: 'javascript/auto',
        },
      ],
    },
    plugins: [
      new rspack.DefinePlugin({
        __ERXES_EXT_ID__: JSON.stringify(id),
        __ERXES_EXT_CSS__: JSON.stringify(css),
      }),
      new ModuleFederationPlugin({
        name,
        filename: 'remoteEntry.js',
        dts: false,
        exposes: { './config': entry },
        shared: Object.fromEntries(
          HOST_LIBRARIES.map((library) => [
            library,
            { singleton: true, import: false, requiredVersion: false },
          ]),
        ),
      }),
    ],
  });

  await new Promise<void>((resolve, reject) =>
    compiler.run((error, stats) => {
      compiler.close(() => undefined);

      if (error) {
        reject(error);
      } else if (stats?.hasErrors()) {
        reject(new Error(stats.toString({ all: false, errors: true })));
      } else {
        resolve();
      }
    }),
  );

  // Source maps and build stats are for the developer, not the browser.
  const files = (await listFiles(outDir)).filter(
    (file) => !file.endsWith('.map') && file !== 'mf-stats.json',
  );
  const contents = await Promise.all(
    files.map(async (file) => [
      file,
      (await readFile(path.join(outDir, file))).toString('base64'),
    ]),
  );

  return { remote: name, files: Object.fromEntries(contents) };
};
