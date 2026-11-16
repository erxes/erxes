import { Suspense } from 'react';
import { PluginBoundary } from './PluginBoundary';
import { usePlugins } from './usePlugins';

/**
 * The `floatingWidget` of each plugin the member may use, mounted once beside the app shell so
 * it stays across navigation: a softphone keeps its call while the member moves between pages.
 */
export const PluginFloatingWidgets = () => {
  const { plugins } = usePlugins();

  return plugins.flatMap(({ remote, config: { name, floatingWidget: Widget } }) =>
    Widget
      ? [
          <PluginBoundary key={remote} name={name} compact>
            <Suspense fallback={null}>
              <Widget />
            </Suspense>
          </PluginBoundary>,
        ]
      : [],
  );
};
