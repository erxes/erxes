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
  navigation?: ComponentType<{ pluginName: string; pathPrefix: string }>;
  navigationItem?: ComponentType<TPluginNavigationItemProps>;
};

export const pluginSettingsSlotsState = atom<TPluginSettingsSlots>({});
