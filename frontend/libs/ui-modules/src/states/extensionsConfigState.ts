import { atom } from 'jotai';
import type { IExtensionUIConfig } from 'erxes-ui';

/**
 * Installed extensions' configs, keyed by plugin name (`dealInsights`, whose
 * remote is `dealInsights_ui`). Apart from `pluginsConfigState`, so nothing
 * that lists plugins ever lists an extension.
 */
export const extensionsConfigState = atom<Record<string, IExtensionUIConfig>>(
  {},
);
