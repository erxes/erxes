import type { ComponentType } from 'react';

/** What a plugin UI exposes as `./config` (`CONFIG`), as for old core-ui. */
export interface PluginConfig {
  name: string;
  path: string;
  icon?: ComponentType<{ className?: string }>;
  modules?: { name: string; path: string; icon?: ComponentType<{ className?: string }> }[];
  /** Hides the plugin from people it is not for (e.g. HR: linked employees). */
  checkAccess?: () => Promise<boolean>;
}

export interface LoadedPlugin {
  /** Module Federation remote name, e.g. `hr_ui`. */
  remote: string;
  config: PluginConfig;
}
