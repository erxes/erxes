import type {
  TDashboardWidget,
  TPanelRecordType,
  TPluginIntegration,
  TPluginSettingsPage,
  TRecordSection,
  TRelationTab,
} from 'erxes-ui';
import type { ComponentType } from 'react';

/** What a plugin UI exposes as `./config` (`CONFIG`). */
interface PluginConfig {
  name: string;
  path: string;
  icon?: ComponentType<{ className?: string }>;
  modules?: { name: string; path: string; icon?: ComponentType<{ className?: string }> }[];
  /** Hides the plugin from people it is not for (e.g. HR: linked employees). */
  checkAccess?: () => Promise<boolean>;
  /** Mounted once beside the app shell on every page, kept across navigation (a softphone). */
  floatingWidget?: ComponentType;
}

export interface LoadedPluginConfig extends PluginConfig {
  /** The well-formed ones of the plugin's sections on customers and companies. */
  recordSections: TRecordSection[];
  /** The well-formed ones of the plugin's records shown in core's side panel. */
  recordTypes: TPanelRecordType[];
  /** The well-formed ones of the plugin's tabs on other records' panels. */
  relationTabs: TRelationTab[];
  /** The well-formed ones of the plugin's settings pages; core's settings link the first. */
  settings: TPluginSettingsPage[];
  /** The well-formed ones of the plugin's tiles in Settings › Integrations. */
  integrations: TPluginIntegration[];
  /** The well-formed ones of the plugin's tiles for the home dashboard. */
  dashboardWidgets: TDashboardWidget[];
}

export interface LoadedPlugin {
  /** Module Federation remote name, e.g. `hr_ui`. */
  remote: string;
  config: LoadedPluginConfig;
}
