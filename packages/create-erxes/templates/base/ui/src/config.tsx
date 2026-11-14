import { IconBox } from '@tabler/icons-react';
import type { IUIConfig } from 'erxes-ui';
import { PLUGIN } from './orpc.ts';

/** What web reads from `./config`: the app tab and the page module under `/__id__/*`. */
export const CONFIG: IUIConfig = {
  name: PLUGIN,
  path: PLUGIN,
  icon: IconBox,
  modules: [{ name: PLUGIN, path: PLUGIN, icon: IconBox }],
};
