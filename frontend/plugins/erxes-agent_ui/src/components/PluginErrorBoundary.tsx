import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from 'erxes-ui';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time and lazy-chunk load failures inside the plugin so a
 * failed dynamic import (common after a deploy invalidates hashed chunks while
 * a tab stays open) shows a recoverable retry UI instead of a blank subtree.
 * The host only guards loading the remote module itself — not page chunks
 * mounted after it.
 */
export class PluginErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log for diagnostics. The retry button only re-renders the subtree, which
    // won't recover a failed dynamic import — a full reload (the Reload button)
    // is the real fix for chunk-load errors after a deploy.
    console.error('[erxes-agent] plugin error', error, info.componentStack);
  }

  handleRetry = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex h-full flex-1 items-center justify-center p-6">
        <div className="flex max-w-md flex-col items-center gap-3 text-center">
          <IconAlertTriangle className="size-8 text-destructive" />
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            This part of the agent console failed to load. This often happens
            after an update — reloading usually fixes it.
          </p>
          <div className="mt-1 flex gap-2">
            <Button onClick={() => window.location.reload()}>
              <IconRefresh className="size-4" /> Reload
            </Button>
            <Button variant="outline" onClick={this.handleRetry}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
