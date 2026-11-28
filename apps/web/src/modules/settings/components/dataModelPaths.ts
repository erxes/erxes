import { type Icon, IconBox, IconColumns, IconPlug } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';

/** The settings "Data model" group: custom objects, every record type's fields, connected plugins. */
export const useSettingsDataModelPaths = (): { name: string; to: string; icon: Icon }[] => {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });

  if (!useCan()('properties.manage')) return [];

  return [
    { name: t('data-objects', 'Objects'), to: paths.settings.dataObjects, icon: IconBox },
    { name: t('data-fields', 'Fields'), to: paths.settings.dataFields, icon: IconColumns },
    {
      name: t('data-plugins', 'Connected plugins'),
      to: paths.settings.dataPlugins,
      icon: IconPlug,
    },
  ];
};
