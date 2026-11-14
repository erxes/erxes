import { IconPlugConnectedX, IconRefresh } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { messageOf } from '~/lib/api';
import { NotFoundPage } from '~/modules/app/NotFoundPage';
import { loadedPluginComponent, loadPluginComponent } from './remotes';
import type { LoadedPlugin } from './types';

const Failure = ({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) => (
  <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
    <IconPlugConnectedX className="size-8 text-muted-foreground" />
    <div className="space-y-1">
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
    </div>
    {onRetry && (
      <Button variant="outline" onClick={onRetry}>
        <IconRefresh />
        Try again
      </Button>
    )}
  </div>
);

const PluginCrash = ({ name }: { name: string }) => {
  const { error, resetBoundary } = useErrorBoundary();

  return (
    <Failure title={`${name} stopped working`} message={messageOf(error)} onRetry={resetBoundary} />
  );
};

/** One plugin failing to draw must not take core down. */
const PluginBoundary = ({ name, children }: { name: string; children: ReactNode }) => (
  <ErrorBoundary
    onError={(error, info) =>
      console.error(`[plugins] ${name} crashed`, error, info.componentStack)
    }
    fallback={<PluginCrash name={name} />}
  >
    {children}
  </ErrorBoundary>
);

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
      <Failure
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
