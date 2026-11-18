import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { orpc } from '@erxes/core-contract/client';
import { pluginLabel } from '~/lib/members';

/** The registry `usePlugins` reads too: one request and cache entry. */
const pluginsQuery = () => orpc.plugins.list.queryOptions({ staleTime: Infinity, retry: false });

/**
 * A plugin's words (its name, a tab's label, a section's title, a record type's title, an
 * activity type's label) in the member's language. They are looked up in the plugin's namespace
 * (its `name`), with the English text as the key; its `./config` and its manifest's
 * `translations` add them. Redrawn when they arrive.
 */
export const usePluginText = () => {
  const { t } = useTranslation(undefined, { bindI18nStore: 'added' });

  return (plugin: string, text: string): string =>
    t(text, { ns: plugin, defaultValue: text, nsSeparator: false, keySeparator: false });
};

/**
 * The plugin's name as an app's: its translation (keyed by its `name`, else by its name
 * capitalised, as a manifest's `translations` key its title), else its `name` capitalised.
 */
export const pluginName = (text: ReturnType<typeof usePluginText>, name: string) =>
  text(name, text(name, name.charAt(0).toUpperCase() + name.slice(1)));

/**
 * Adds each installed plugin's manifest `translations` to its namespace, for `usePluginText`.
 * A word its UI's `./config` already added stays as the UI has it. Mounted once, in the main layout.
 */
export const usePluginTranslations = () => {
  const { data } = useQuery(pluginsQuery());
  const { i18n } = useTranslation();

  useEffect(() => {
    for (const { name, manifest } of data?.data ?? []) {
      for (const [language, texts] of Object.entries(manifest?.translations ?? {})) {
        i18n.addResourceBundle(language, name, texts, true, false);
      }
    }
  }, [data, i18n]);
};

/**
 * A plugin's title by its name, in the member's language: its manifest's `title` translated,
 * else its name as people read it (`hr` → `HR`).
 */
export const usePluginTitle = () => {
  const { data } = useQuery(pluginsQuery());
  const text = usePluginText();

  return (name: string) => {
    const title = data?.data.find((plugin) => plugin.name === name)?.manifest?.title;

    return text(name, title ?? pluginLabel(name));
  };
};
