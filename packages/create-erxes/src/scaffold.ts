import { mkdir, readdir, readFile, symlink, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import type { OldPlugin } from './existing-plugins';
import type { PluginNames } from './naming';

/** scripts/templates.ts writes them at build time; this file and dist/index.js are both one level down. */
const TEMPLATES = fileURLToPath(new URL('../dist/templates/', import.meta.url));

// npm strips dotfiles like .gitignore from published packages, so templates
// store them with a leading underscore.
const DOTFILES = new Map([
  ['_gitignore', '.gitignore'],
  ['_dockerignore', '.dockerignore'],
  ['_env.example', '.env.example'],
  ['_node-version', '.node-version'],
]);

export type ScaffoldOptions = {
  names: PluginNames;
  description: string;
  apiPort: number;
  uiPort: number;
  pnpmVersion: string;
  /** The old plugin this repo ports. Adds the migration kit. */
  migrateFrom?: OldPlugin;
};

/** A value goes into a single-quoted string in code and a string in JSON; Markdown takes it as is. */
const escapeFor = (file: string) => {
  switch (extname(file)) {
    case '.ts':
    case '.tsx':
      return (value: string) => value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
    case '.json':
      return (value: string) => JSON.stringify(value).slice(1, -1);
    default:
      return (value: string) => value;
  }
};

/** Fills `__token__`s from the template only: a value that looks like a token stays as typed. */
const applyTokens = (
  text: string,
  tokens: Map<string, string>,
  escape = (value: string) => value,
) =>
  text.replace(/__[A-Za-z][A-Za-z0-9]*__/g, (token) => {
    const value = tokens.get(token);

    return value === undefined ? token : escape(value);
  });

/** Copies a template layer into `targetDir`, renaming dotfiles and filling tokens. */
const copyLayer = async (layer: string, targetDir: string, tokens: Map<string, string>) => {
  const root = join(TEMPLATES, layer);
  const entries = await readdir(root, { recursive: true, withFileTypes: true });

  for (const entry of entries.filter((item) => item.isFile())) {
    const rel = relative(root, join(entry.parentPath, entry.name));
    const name = DOTFILES.get(entry.name) ?? applyTokens(entry.name, tokens);
    const path = join(targetDir, dirname(rel), name);
    const text = await readFile(join(entry.parentPath, entry.name), 'utf8');

    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, applyTokens(text, tokens, escapeFor(path)));
  }
};

const Dependencies = z.record(z.string(), z.string());

const PackageJson = z.object({
  scripts: Dependencies.default({}),
  devDependencies: Dependencies.default({}),
});

const readPackageJson = async (path: string) => {
  const json = z.record(z.string(), z.unknown()).parse(JSON.parse(await readFile(path, 'utf8')));

  // Over the whole file, so every key keeps its place and the formatter has nothing to move.
  return { ...json, ...PackageJson.parse(json) };
};

const writeJson = (path: string, value: unknown) =>
  writeFile(path, `${JSON.stringify(value, null, 2)}\n`);

const sortKeys = (record: Record<string, string>) =>
  Object.fromEntries(Object.entries(record).toSorted(([a], [b]) => a.localeCompare(b)));

/**
 * Claude Code loads skills from `.claude/skills`; the repo keeps them in
 * `.agents/skills`, so the first links to the second. Git commits the link.
 */
const linkSkills = async (targetDir: string) => {
  const link = join(targetDir, '.claude', 'skills');

  await mkdir(dirname(link), { recursive: true });

  try {
    await symlink(join('..', '.agents', 'skills'), link, 'dir');
  } catch (error) {
    // Windows without Developer Mode refuses symlinks; a junction needs no rights.
    if (process.platform !== 'win32') throw error;
    await symlink(join(targetDir, '.agents', 'skills'), link, 'junction');
  }
};

const migrationSkill = (plugin: OldPlugin) => `
- This repo ports the old erxes \`${plugin}\` plugin. Work through
  \`MIGRATION.md\` with the \`plugin-migrate\` skill.`;

/** Writes a plugin for the new core: the base template, plus the migration kit for a port. */
export const scaffold = async (targetDir: string, options: ScaffoldOptions) => {
  const { names, migrateFrom } = options;

  const tokens = new Map([
    ['__id__', names.id],
    ['__Pascal__', names.pascal],
    ['__title__', names.title],
    ['__description__', options.description],
    ['__apiPort__', String(options.apiPort)],
    ['__uiPort__', String(options.uiPort)],
    ['__pnpmVersion__', options.pnpmVersion],
    ['__migrationSkill__', migrateFrom ? migrationSkill(migrateFrom) : ''],
  ]);

  await copyLayer('base', targetDir, tokens);
  // `@<id>/api` takes its place in the sorted list only once it has the plugin's name.
  const uiPackageJson = join(targetDir, 'ui/package.json');
  const ui = await readPackageJson(uiPackageJson);

  await writeJson(uiPackageJson, { ...ui, devDependencies: sortKeys(ui.devDependencies) });
  await linkSkills(targetDir);

  if (!migrateFrom) return;

  // The migration kit's package.json holds only the scripts and dev
  // dependencies it adds to the base one.
  const packageJson = join(targetDir, 'package.json');
  const base = await readPackageJson(packageJson);

  await copyLayer('migrate', targetDir, tokens);
  const extra = await readPackageJson(packageJson);

  await writeJson(packageJson, {
    ...base,
    scripts: { ...base.scripts, ...extra.scripts },
    devDependencies: sortKeys({ ...base.devDependencies, ...extra.devDependencies }),
  });
};
