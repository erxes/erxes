// @vitest-environment happy-dom
import { describe, expect, it } from 'vite-plus/test';
import { i18n, i18nReady } from '~/i18n';
import enSettings from '../locales/en/settings.json';
import enWorkspace from '../locales/en/workspace.json';
import mnSettings from '../locales/mn/settings.json';
import mnWorkspace from '../locales/mn/workspace.json';

const isTree = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/** Every leaf's dotted path. */
const leaves = (tree: Record<string, unknown>, prefix = ''): string[] =>
  Object.entries(tree).flatMap(([key, value]) =>
    isTree(value) ? leaves(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  );

/** A key without its plural form: languages differ in forms, `_one` and `_other` are one word. */
const word = (key: string) => key.replace(/_(zero|one|two|few|many|other)$/, '');

/** The words both namespaces hold. */
const inBoth = (settings: Record<string, unknown>, workspace: Record<string, unknown>) => {
  const settingsKeys = new Set(leaves(settings));

  return leaves(workspace).filter((key) => settingsKeys.has(key));
};

/** Every locale file's text, by its path. */
const localeFiles = import.meta.glob<string>('../locales/*/*.json', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/**
 * The keys a locale file names twice in one object: JSON keeps the last, so the first word
 * never shows. Files are one key per line, as the formatter writes them.
 */
const duplicateKeys = (text: string) => {
  const objects: Set<string>[] = [new Set()];
  const found: string[] = [];

  text.split('\n').forEach((line, index) => {
    const key = /^\s*"([^"]+)"\s*:/.exec(line)?.[1];
    const keys = objects.at(-1);

    if (key && keys?.has(key)) found.push(`${index + 1}: ${key}`);

    if (key) keys?.add(key);

    for (const char of line) {
      if (char === '{') objects.push(new Set());
      else if (char === '}') objects.pop();
    }
  });

  return found;
};

describe('i18n namespaces', () => {
  it('names no key twice in one object', () => {
    const files = Object.entries(localeFiles);

    expect(files.length).toBeGreaterThan(10);
    expect(
      files.flatMap(([path, text]) => duplicateKeys(text).map((at) => `${path}:${at}`)),
    ).toEqual([]);
  });

  it('bundles the shared words, not the settings pages’ own', async () => {
    await i18nReady;

    expect(i18n.hasResourceBundle('en', 'workspace')).toBe(true);
    expect(i18n.hasResourceBundle('en', 'settings')).toBe(false);
    expect(i18n.t('tags.add-tag', { ns: 'workspace' })).toBe('Add tag');
    // The team members' words come with the settings pages or a member's panel.
    expect(i18n.exists('team-member.name', { ns: 'workspace' })).toBe(false);
  });

  it('loads the settings pages’ words on demand', async () => {
    await i18nReady;
    await i18n.loadNamespaces('settings');

    expect(i18n.hasResourceBundle('en', 'settings')).toBe(true);
    expect(i18n.t('general.title', { ns: 'settings' })).toBe('General');
  });

  it('keeps each word in one namespace', () => {
    expect(inBoth(enSettings, enWorkspace)).toEqual([]);
    expect(inBoth(mnSettings, mnWorkspace)).toEqual([]);
  });

  it('gives Mongolian the shared words English has', () => {
    const mn = new Set(leaves(mnWorkspace).map(word));

    expect(leaves(enWorkspace).filter((key) => !mn.has(word(key)))).toEqual([]);
  });
});
