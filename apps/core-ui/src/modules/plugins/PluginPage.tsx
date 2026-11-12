import { IconPlugConnectedX, IconRefresh } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import {
  Component,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
  useEffect,
  useState,
} from 'react';
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

/** One plugin failing to draw must not take core down. */
class PluginBoundary extends Component<
  { name: string; children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[plugins] ${this.props.name} crashed`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <Failure
          title={`${this.props.name} stopped working`}
          message={this.state.error.message}
          onRetry={() => this.setState({ error: null })}
        />
      );
    }

    return this.props.children;
  }
}

/** Renders a plugin's page module under `/<plugin path>/*`; the plugin draws its own sidebar. */
export const PluginPage = ({ plugin }: { plugin: LoadedPlugin | undefined }) => {
  const module = plugin?.config.modules?.[0]?.name ?? plugin?.config.name ?? '';

  const [Page, setPage] = useState<ComponentType | null>(() =>
    plugin ? (loadedPluginComponent(plugin.remote, module) ?? null) : null,
  );

  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!plugin) {
      return undefined;
    }

    let active = true;

    setError(null);
    loadPluginComponent(plugin.remote, module)
      .then((component) => active && setPage(() => component))
      .catch((reason: unknown) => {
        if (active) {
          setPage(null);
          setError(reason instanceof Error ? reason.message : 'The plugin could not be loaded');
        }
      });

    return () => {
      active = false;
    };
  }, [plugin, module, attempt]);

  if (!plugin) {
    return <NotFoundPage />;
  }

  if (error) {
    return (
      <Failure
        title={`${plugin.config.name} is not available`}
        message={error}
        onRetry={() => setAttempt((value) => value + 1)}
      />
    );
  }

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
