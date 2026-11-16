import { isCoreFieldType, type PropertyContentType } from '@erxes/core-contract';
import { useTranslation } from 'react-i18next';
import { pluginPropertyTypes } from '~/modules/plugins/pluginProperties';
import { usePluginText } from '~/modules/plugins/pluginText';
import { usePlugins } from '~/modules/plugins/usePlugins';
import { PROPERTY_TYPES } from './constants';

/** A record type's name in the member's language: core's own, or the plugin's record title. */
export const usePropertyTypeLabel = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { plugins } = usePlugins();
  const text = usePluginText();
  const pluginTypes = pluginPropertyTypes(plugins);

  return (contentType: PropertyContentType) => {
    if (isCoreFieldType(contentType)) {
      const type = PROPERTY_TYPES[contentType];

      return t(`content-type.${type.i18nKey}`, type.label);
    }

    const type = pluginTypes.find((entry) => entry.type === contentType);

    return type ? text(type.plugin, type.title) : contentType;
  };
};
