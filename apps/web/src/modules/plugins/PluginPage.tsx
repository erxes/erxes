import { Spinner } from 'erxes-ui';
import { useQuery } from '@tanstack/react-query';
import { NotFoundPage } from '~/modules/app/NotFoundPage';
import { PluginBoundary, PluginError } from './PluginBoundary';
import { loadedPluginComponent, loadPluginComponent } from './remotes';
import type { LoadedPlugin } from './types';

/** Renders a plugin app's page module (`./<module>`) under its `/<path>/*`; the plugin draws its own sidebar. */
export const PluginPage = ({
  plugin,
  module,
}: {
  plugin: LoadedPlugin | undefined;
  module: string;
}) => {
  const remote = plugin?.remote ?? '';

  // Module Federation loading, not an API call: keyed by the module it loads.
  const page = useQuery({
    queryKey: ['plugin-page', remote, module],
    queryFn: () => loadPluginComponent(remote, module),
    initialData: () => loadedPluginComponent(remote, module),
    enabled: Boolean(plugin),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });

  if (!plugin) {
    return <NotFoundPage />;
  }

  if (page.error && !page.isFetching) {
    return (
      <PluginError
        name={plugin.config.name}
        title={`${plugin.config.name} is not available`}
        error={page.error}
        onRetry={() => void page.refetch()}
      />
    );
  }

  const Page = page.data;

  if (!Page) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <PluginBoundary name={plugin.config.name}>
      <Page />
    </PluginBoundary>
  );
};
