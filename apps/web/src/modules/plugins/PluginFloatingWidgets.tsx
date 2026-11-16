import { Suspense } from 'react';
import { PluginBoundary } from './PluginBoundary';
import { usePlugins } from './usePlugins';

/**
 * The `floatingWidget` of each plugin the member may use, mounted once beside the app shell so
 * it stays across navigation: a softphone keeps its call while the member moves between pages.
 * They sit in the bottom-right corner above the page and take no room from it; a crashed one
 * shows its failure there.
 */
export const PluginFloatingWidgets = () => {
  const { plugins } = usePlugins();

  const widgets = plugins.flatMap(({ remote, config }) =>
    config.floatingWidget ? [{ remote, name: config.name, Widget: config.floatingWidget }] : [],
  );

  if (!widgets.length) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2 [&>[role=alert]]:rounded-md [&>[role=alert]]:border [&>[role=alert]]:bg-background [&>[role=alert]]:p-3 [&>[role=alert]]:shadow-md">
      {widgets.map(({ remote, name, Widget }) => (
        <PluginBoundary key={remote} name={name} compact>
          <Suspense fallback={null}>
            <Widget />
          </Suspense>
        </PluginBoundary>
      ))}
    </div>
  );
};
