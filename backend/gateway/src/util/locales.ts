import * as fs from 'fs';
import * as path from 'path';
import { getPlugin, getPlugins } from 'erxes-api-shared/utils';

const LNG_PATTERN = /^[a-zA-Z]{2,5}(?:[-_][a-zA-Z0-9]{2,8})?$/;
const FILE_PATTERN = /^[a-zA-Z0-9._-]+\.json$/;

export const isValidLocaleParams = (lng: string, file: string): boolean =>
  LNG_PATTERN.test(lng) && FILE_PATTERN.test(file);

const readLocalLocale = (lng: string, file: string): unknown | null => {
  const localesRoot = path.join(__dirname, '../locales');

  const requestedPath = path.resolve(localesRoot, lng, file);
  const realPath = fs.realpathSync(requestedPath);

  if (!realPath.startsWith(localesRoot + path.sep)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(realPath).toString());
};

const fetchPluginLocale = async (
  lng: string,
  file: string,
): Promise<unknown | null> => {
  for (const pluginName of await getPlugins()) {
    try {
      const plugin = await getPlugin(pluginName);

      if (!plugin?.address) continue;

      const response = await fetch(`${plugin.address}/locales/${lng}/${file}`, {
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch {
      console.log(`Error fetching locale from plugin: ${pluginName}`);
    }
  }

  return null;
};

export const resolveLocale = async (
  lng: string,
  file: string,
): Promise<unknown | null> => {
  try {
    const local = readLocalLocale(lng, file);

    if (local !== null) {
      return local;
    }
  } catch {
    console.log('Locale not found locally, trying plugins');
  }

  return fetchPluginLocale(lng, file);
};
