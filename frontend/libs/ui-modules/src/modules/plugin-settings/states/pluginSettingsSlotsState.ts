import { atom } from 'jotai';
import type { ComponentType, ElementType } from 'react';

export type TPluginNavigationItemProps = {
  pathPrefix: string;
  path: string;
  name: string;
  icon?: ElementType;
  subPaths?: { name: string; path: string; onClick?: () => void }[];
};

export type TPluginSettingsSlots = {
  tags?: ComponentType<{ pluginName: string }>;
  properties?: ComponentType<{ pluginName: string; basePath: string }>;
  /** The member's own notification choices for the plugin's events. */
  notifications?: ComponentType<{ pluginName: string }>;
  /** Menu items (Tags / Properties / Notification) for the plugin's settings sidebar. */
  navigation?: ComponentType<{ pluginName: string; pathPrefix: string }>;
  navigationItem?: ComponentType<TPluginNavigationItemProps>;
};

export const pluginSettingsSlotsState = atom<TPluginSettingsSlots>({});
