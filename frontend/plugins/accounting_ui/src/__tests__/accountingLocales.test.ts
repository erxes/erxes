import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const pluginSource = join(__dirname, '..');
const localeDir = join(__dirname, '../../../../../backend/gateway/src/locales');

const readLocale = (language: string): Record<string, string> =>
  JSON.parse(
    readFileSync(join(localeDir, language, 'accounting.json'), 'utf8'),
  );

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : sourceFiles(path);
    }
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });

const accountingKeys = () =>
  sourceFiles(pluginSource).flatMap((file) => {
    const source = readFileSync(file, 'utf8');
    const namespaces = [...source.matchAll(/useTranslation\(([^)]*)\)/g)].map(
      ([, args]) => args.trim(),
    );
    const usesAccounting = namespaces.length
      ? namespaces.every((args) => args === "'accounting'")
      : source.includes("TFunction<'accounting'>");
    if (!usesAccounting) {
      return [];
    }
    return [...source.matchAll(/\bt\(\s*'([^']+)'\s*[,)]/g)].map(([, key]) => ({
      file: file.replace(pluginSource, 'src'),
      key,
    }));
  });

const translates = (locale: Record<string, string>, key: string) =>
  key in locale || (`${key}_one` in locale && `${key}_other` in locale);

describe('accounting translations', () => {
  const english = readLocale('en');
  const mongolian = readLocale('mn');

  it('gives every label an accounting screen asks for an English and a Mongolian text', () => {
    const keys = accountingKeys();

    expect(keys.length).toBeGreaterThan(600);
    expect(keys.filter(({ key }) => !translates(english, key))).toEqual([]);
    expect(keys.filter(({ key }) => !translates(mongolian, key))).toEqual([]);
  });

  it('keeps the English and Mongolian files in step so neither language falls back to raw keys', () => {
    expect(Object.keys(english).filter((key) => !(key in mongolian))).toEqual(
      [],
    );
    expect(Object.keys(mongolian).filter((key) => !(key in english))).toEqual(
      [],
    );
  });
});
