import { useState } from 'react';
import { z } from 'zod';
import { useSession } from '~/modules/auth/session';
import { DASHBOARD_DEFAULT_LAYOUT, DASHBOARD_MAX_ITEMS } from '../constants/dashboardGrid';
import type { TDashboardItem } from '../types/dashboardTypes';

/*
 * Old erxes saved the layout on the server (`dashboardLayoutSave`); the new
 * core has no such API yet, so it lives in this browser, per user.
 */
const storageKey = (userId: string) => `erxes-home-dashboard:${userId}`;

const StoredItem = z.object({
  id: z.string(),
  type: z.string(),
  x: z.number().int(),
  y: z.number().int(),
  w: z.number().int(),
  h: z.number().int(),
});

/** The saved tiles; ones that no longer parse are dropped. */
const read = (userId: string): TDashboardItem[] | null => {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const parsed: unknown = raw ? JSON.parse(raw) : null;

    if (!Array.isArray(parsed)) return null;

    return parsed
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
