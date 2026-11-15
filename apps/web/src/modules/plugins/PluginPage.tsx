import { Spinner } from 'erxes-ui';
import { useQuery } from '@tanstack/react-query';
import { NotFoundPage } from '~/modules/app/NotFoundPage';
import { PluginBoundary, PluginFailure } from './PluginBoundary';
import { loadedPluginComponent, loadPluginComponent } from './remotes';
import type { LoadedPlugin } from './types';

/** Renders a plugin's page module under `/<plugin path>/*`; the plugin draws its own sidebar. */
export const PluginPage = ({ plugin }: { plugin: LoadedPlugin | undefined }) => {
  const module = plugin?.config.modules?.[0]?.name ?? plugin?.config.name ?? '';

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
      <PluginFailure
        title={`${plugin.config.name} is not available`}
        message={page.error.message}
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
