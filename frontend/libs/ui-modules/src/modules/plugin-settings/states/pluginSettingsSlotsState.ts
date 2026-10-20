import { atom } from 'jotai';
import type { ComponentType } from 'react';

/**
 * Organization settings pages a plugin can show inside its own settings,
 * scoped to that plugin's types. core-ui provides them; plugins render them
 * through `PluginSettingsRoutes` / `PluginSharedSettingsNavigation`, so they
 * never import core code.
 */
export type TPluginSettingsSlots = {
  /** Tags page listing only the plugin's tag types. */
  tags?: ComponentType<{ pluginName: string }>;
  /** Properties pages listing only the plugin's property types. */
  properties?: ComponentType<{ pluginName: string; basePath: string }>;
  /** Menu items (Tags / Properties) for the plugin's settings sidebar. */
  navigation?: ComponentType<{ pluginName: string; pathPrefix: string }>;
};

export const pluginSettingsSlotsState = atom<TPluginSettingsSlots>({});
