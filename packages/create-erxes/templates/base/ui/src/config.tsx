import { IconBox } from '@tabler/icons-react';
import type { IUIConfig } from 'erxes-ui';
import { lazy } from 'react';
import { ITEM_TYPE } from '@/items/useItems.ts';
import { PLUGIN } from '~/orpc.ts';

// Loaded when an item first opens: web loads `./config` for every page.
const panel = () => import('@/items/ItemPanel.tsx');
const ItemTitle = lazy(async () => ({ default: (await panel()).ItemTitle }));
const ItemDetail = lazy(async () => ({ default: (await panel()).ItemDetail }));
const ItemNew = lazy(async () => ({ default: (await panel()).ItemNew }));

/**
 * What web reads from `./config`: the app tab, the page module under `/__id__/*`, and the
 * records core's side panel opens. Core draws an item's panel; these slots fill it. An item
 * expands to `/__id__/<id>` (`__Pascal__.tsx`).
 */
export const CONFIG: IUIConfig = {
  name: PLUGIN,
  path: PLUGIN,
  icon: IconBox,
  modules: [{ name: PLUGIN, path: PLUGIN, icon: IconBox }],
  recordTypes: [
    {
      contentType: ITEM_TYPE,
      title: 'Item',
      icon: IconBox,
      detailPath: (id) => `/${PLUGIN}/${encodeURIComponent(id)}`,
      Title: ItemTitle,
      Detail: ItemDetail,
      New: ItemNew,
    },
  ],
};
