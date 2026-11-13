import { jsonOf } from 'erxes-ui';
import { useState } from 'react';
import { z } from 'zod';
import { useSession } from '~/modules/auth/session';
import { DASHBOARD_DEFAULT_LAYOUT, DASHBOARD_MAX_ITEMS } from '../constants/dashboardGrid';
import type { TDashboardItem } from '../types/dashboardTypes';

/*
 * The layout is kept in this browser, per user: core has no API to save it.
 */
const storageKey = (userId: string) => `erxes-home-dashboard:${userId}`;

const StoredItem = z.object({
  id: z.string(),
  type: z.string(),
  x: z.int(),
  y: z.int(),
  w: z.int(),
  h: z.int(),
});

/** The saved tiles; ones that no longer parse are dropped. */
const read = (userId: string): TDashboardItem[] | null => {
  try {
    const saved = jsonOf(z.array(z.unknown())).safeParse(localStorage.getItem(storageKey(userId)));

    if (!saved.success) return null;

    return saved.data
      .flatMap((item) => {
        const tile = StoredItem.safeParse(item);

        return tile.success ? [tile.data] : [];
      })
      .slice(0, DASHBOARD_MAX_ITEMS);
  } catch {
    return null;
  }
};

/** The user's saved tiles, or the default layout until they save one. */
export const useDashboardLayout = () => {
  const { user } = useSession();
  const [stored, setStored] = useState(() => read(user.id));

  return {
    items: stored ?? DASHBOARD_DEFAULT_LAYOUT,
    isCustomized: stored !== null,
    save: (items: TDashboardItem[]) => {
      const clean = items.map(({ id, type, x, y, w, h }) => ({ id, type, x, y, w, h }));

      localStorage.setItem(storageKey(user.id), JSON.stringify(clean));
      setStored(clean);
    },
    reset: () => {
      localStorage.removeItem(storageKey(user.id));
      setStored(null);
    },
  };
};
