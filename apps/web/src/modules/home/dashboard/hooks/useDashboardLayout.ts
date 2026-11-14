import { storedFamily } from 'erxes-ui';
import { useAtom } from 'jotai';
import { RESET } from 'jotai/utils';
import { z } from 'zod';
import { useSession } from '~/modules/auth/session';
import { DASHBOARD_DEFAULT_LAYOUT, DASHBOARD_MAX_ITEMS } from '../constants/dashboardGrid';
import type { TDashboardItem } from '../types/dashboardTypes';

const StoredItem = z.object({
  id: z.string(),
  type: z.string(),
  x: z.int(),
  y: z.int(),
  w: z.int(),
  h: z.int(),
});

/** The layout is kept in this browser, per user: core has no API to save it. */
const dashboardLayoutState = storedFamily({
  key: 'erxes:home:dashboard',
  schema: z.array(StoredItem).max(DASHBOARD_MAX_ITEMS).nullable(),
  initial: null,
});

/** The user's saved tiles, or the default layout until they save one. */
export const useDashboardLayout = () => {
  const { user } = useSession();
  const [saved, setSaved] = useAtom(dashboardLayoutState(user.id));

  return {
    items: saved ?? DASHBOARD_DEFAULT_LAYOUT,
    isCustomized: saved !== null,
    save: (items: TDashboardItem[]) =>
      setSaved(items.map(({ id, type, x, y, w, h }) => ({ id, type, x, y, w, h }))),
    reset: () => setSaved(RESET),
  };
};
