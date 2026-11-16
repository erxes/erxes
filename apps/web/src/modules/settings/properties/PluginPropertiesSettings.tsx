import { Spinner } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { NotFoundPage } from '~/modules/app/NotFoundPage';
import { pluginPropertyTypes } from '~/modules/plugins/pluginProperties';
import { usePlugins } from '~/modules/plugins/usePlugins';
import { PropertiesSettingsRoutes } from './PropertiesSettingsRoutes';

/**
 * Settings › Properties of plugins' record types, `/settings/properties/<plugin>.<type>`: the
 * page core draws for its own records, its sidebar listing that plugin's record types.
 */
export const PluginPropertiesSettings = () => {
  const { plugins, loading } = usePlugins();
  const [plugin] = (useParams()['*'] ?? '').split('.');
  const types = pluginPropertyTypes(plugins).map((entry) => entry.type);
  const own = types.filter((type) => type.startsWith(`${plugin}.`));
  const [first, ...rest] = own.length ? own : types;

  if (loading) return <Spinner area="lg" />;

  if (!first) return <NotFoundPage />;

  return <PropertiesSettingsRoutes types={[first, ...rest]} />;
};
