import { useTranslation } from 'react-i18next';

/**
 * A plugin's words from its config (its name, a tab's label, a section's title) in the member's
 * language. They are looked up in the plugin's namespace (`config.name`), with the English text as
 * the key; the plugin adds them from `./config`, so they are there before core draws them.
 */
export const usePluginText = () => {
  const { t } = useTranslation();

  return (plugin: string, text: string): string =>
    t(text, { ns: plugin, defaultValue: text, nsSeparator: false, keySeparator: false });
};

/** The plugin's name as an app's: its translation, else its `name` capitalised. */
export const pluginName = (text: ReturnType<typeof usePluginText>, name: string) =>
  text(name, name.charAt(0).toUpperCase() + name.slice(1));
