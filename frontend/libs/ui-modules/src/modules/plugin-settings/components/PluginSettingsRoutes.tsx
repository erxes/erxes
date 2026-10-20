import { Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { pluginSettingsSlotsState } from '../states/pluginSettingsSlotsState';
import { useAtomValue } from 'jotai';

/**
 * A plugin's settings routes plus the organization pages it uses: renders
 * `tags` and `properties/*` (scoped to the plugin) and `children` for
 * everything else. Mount it at the plugin's `settings/*` route.
 */
export const PluginSettingsRoutes = ({
  pluginName,
  basePath,
  children,
}: {
  pluginName: string;
  /** Absolute settings base, e.g. `/sales/settings`. */
  basePath: string;
  children: ReactNode;
}) => {
  const { tags: Tags, properties: Properties } = useAtomValue(
    pluginSettingsSlotsState,
  );

  return (
    <Routes>
      {Tags && <Route path="tags" element={<Tags pluginName={pluginName} />} />}
      {Properties && (
        <Route
          path="properties/*"
          element={
            <Properties
              pluginName={pluginName}
              basePath={`${basePath.replace(/\/$/, '')}/properties`}
            />
          }
        />
      )}
      <Route path="*" element={children} />
    </Routes>
  );
};
