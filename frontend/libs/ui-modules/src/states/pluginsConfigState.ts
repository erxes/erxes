import { atom } from 'jotai';
import { IUIConfig } from 'erxes-ui';

export type PluginsConfigState = {
  [key: string]: IUIConfig;
};

export const pluginsConfigState = atom<PluginsConfigState | null>(null);
