import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { build } from 'esbuild';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import { replaceTscAliasPaths } from 'tsc-alias';

const require = createRequire(import.meta.url);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = join(packageRoot, 'src');
const outputRoot = join(packageRoot, 'dist');

const slash = (path) => path.replaceAll('\\', '/');

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (
        /^__(?:stories|tests)__$|\.(?:stories|test|spec)\./.test(entry.name)
      ) {
        return [];
      }
      if (entry.isDirectory()) return sourceFiles(path);
      return /(?<!\.d)\.tsx?$/.test(entry.name) ? [path] : [];
    }),
  );
  return files.flat().sort();
}

function emitDeclarations() {
  const result = spawnSync(
    process.execPath,
    [require.resolve('typescript/bin/tsc'), '-p', 'tsconfig.dts.json'],
    { cwd: packageRoot, encoding: 'utf8' },
  );
  if (result.error) throw result.error;
  const diagnostics = `${result.stdout}${result.stderr}`;
  if (result.status !== 0) {
    process.stderr.write(diagnostics);
    if (result.signal || /error TS(?:4|9)\d{3}:/.test(diagnostics)) {
      throw new Error('erxes-ui declaration emit is incomplete.');
    }
  }
}

async function buildStyles() {
  const theme = await readFile(join(sourceRoot, 'theme.css'), 'utf8');
  const variables = new Set(
    [...theme.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]),
  );
  variables.add('--input');
  variables.add('--spacing');

  const hostPath = resolve(packageRoot, '../../core-ui/src/styles.css');
  const host = postcss.parse(await readFile(hostPath, 'utf8'), {
    from: hostPath,
  });
  const defaults = postcss.atRule({ name: 'layer', params: 'base' });
  host.walkRules((rule) => {
    if (![':root', '.dark'].includes(rule.selector)) return;
    const tokens = postcss.rule({ selector: rule.selector });
    rule.walkDecls((declaration) => {
      if (variables.has(declaration.prop)) tokens.append(declaration.clone());
    });
    if (tokens.nodes.length) defaults.append(tokens);
  });

  if (!defaults.toString().includes('--primary:')) {
    throw new Error('The core-ui default theme is missing.');
  }
  const from = join(sourceRoot, 'styles.css');
  const styles = postcss.parse(await readFile(from, 'utf8'), { from });
  styles.append(defaults);
  const result = await postcss([tailwindcss({ optimize: true })]).process(
    styles,
    { from, to: join(outputRoot, 'styles.css'), map: false },
  );
  await writeFile(join(outputRoot, 'styles.css'), result.css);
  await copyFile(join(sourceRoot, 'theme.css'), join(outputRoot, 'theme.css'));
}

export async function buildPackage() {
  const files = await sourceFiles(sourceRoot);
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });

  await build({
    absWorkingDir: packageRoot,
    entryPoints: files,
    outbase: sourceRoot,
    outdir: outputRoot,
    bundle: true,
    splitting: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    jsx: 'automatic',
    packages: 'external',
    alias: { 'erxes-ui': sourceRoot },
    tsconfig: join(packageRoot, 'tsconfig.dts.json'),
    chunkNames: 'chunks/[name]-[hash]',
    define: { 'process.env.NODE_ENV': 'process.env.NODE_ENV' },
  });

  emitDeclarations();
  await readFile(join(outputRoot, 'index.d.ts'));
  await replaceTscAliasPaths({
    configFile: join(packageRoot, 'tsconfig.dts.json'),
    resolveFullPaths: true,
    resolveFullExtension: '.js',
  });
  await buildStyles();

  const sourceManifest = JSON.parse(
    await readFile(join(packageRoot, 'package.json'), 'utf8'),
  );
  const manifest = { ...sourceManifest };
  delete manifest.scripts;
  delete manifest.devDependencies;
  manifest.name = '@erxes/ui';
  manifest.type = 'module';
  manifest.main = './index.js';
  manifest.types = './index.d.ts';
  manifest.style = './styles.css';
  manifest.sideEffects = ['**/*.css'];
  manifest.files = ['**/*.js', '**/*.d.ts', '*.css', 'README.md'];
  manifest.exports = {
    '.': { types: './index.d.ts', default: './index.js' },
    './styles.css': './styles.css',
    './style.css': './styles.css',
    './theme.css': './theme.css',
    './package.json': './package.json',
    './*': { types: './*.d.ts', default: './*.js' },
  };

  for (const file of files) {
    const path = slash(relative(sourceRoot, file)).replace(/\.tsx?$/, '');
    const output = join(outputRoot, `${path}.js`);
    const cssPath = slash(
      relative(dirname(output), join(outputRoot, 'styles.css')),
    );
    const cssImport = cssPath.startsWith('.') ? cssPath : `./${cssPath}`;
    const component =
      file.endsWith('.tsx') ||
      path === 'index' ||
      /^(components|modules)(\/.*)?\/index$/.test(path);
    const client = component || /(^|\/)hooks\//.test(path);
    if (component) manifest.sideEffects.push(`./${path}.js`);
    const code = await readFile(output, 'utf8');
    await writeFile(
      output,
      `${client ? "'use client';\n" : ''}${
        component ? `import ${JSON.stringify(cssImport)};\n` : ''
      }${code}`,
    );
    if (path.endsWith('/index')) {
      manifest.exports[`./${path.slice(0, -6)}`] = {
        types: `./${path}.d.ts`,
        default: `./${path}.js`,
      };
    }
  }

  await writeFile(
    join(outputRoot, 'package.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  await copyFile(join(packageRoot, 'README.md'), join(outputRoot, 'README.md'));
  process.stdout.write(
    `Built @erxes/ui with ${files.length} JavaScript entries and ready-to-use styles.\n`,
  );
}

if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  await buildPackage();
}
