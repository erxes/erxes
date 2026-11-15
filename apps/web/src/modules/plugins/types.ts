import type { TRecordSection } from 'erxes-ui';
import type { ComponentType } from 'react';

/** What a plugin UI exposes as `./config` (`CONFIG`). */
export interface PluginConfig {
  name: string;
  path: string;
  icon?: ComponentType<{ className?: string }>;
  modules?: { name: string; path: string; icon?: ComponentType<{ className?: string }> }[];
  /** Hides the plugin from people it is not for (e.g. HR: linked employees). */
  checkAccess?: () => Promise<boolean>;
}

interface LoadedPluginConfig extends PluginConfig {
  /** The well-formed ones of the plugin's sections on customers and companies. */
  recordSections: TRecordSection[];
}

export interface LoadedPlugin {
  /** Module Federation remote name, e.g. `hr_ui`. */
  remote: string;
  config: LoadedPluginConfig;
}
