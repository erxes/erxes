import { useTranslation } from 'react-i18next';

const formatPluginName = (name: string) =>
  /[\sA-Z]/.test(name) ? name : name.charAt(0).toUpperCase() + name.slice(1);

export const usePluginDisplayName = (name: string, i18n?: boolean) => {
  const { t } = useTranslation(i18n ? name : 'common');
  const translatedName = i18n ? t(name, { defaultValue: name }) : name;

  return formatPluginName(translatedName);
};
