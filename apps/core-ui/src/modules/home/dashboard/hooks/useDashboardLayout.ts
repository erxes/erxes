import { useState } from 'react';
import { useSession } from '~/modules/auth/session';
import { DASHBOARD_DEFAULT_LAYOUT, DASHBOARD_MAX_ITEMS } from '../constants/dashboardGrid';
import type { TDashboardItem } from '../types/dashboardTypes';

/*
 * Old erxes saved the layout on the server (`dashboardLayoutSave`); the new
 * core has no such API yet, so it lives in this browser, per user.
 */
const storageKey = (userId: string) => `erxes-home-dashboard:${userId}`;

const isInt = (value: unknown): value is number => Number.isInteger(value);

const isItem = (value: unknown): value is TDashboardItem => {
  const item = value as Partial<TDashboardItem> | null;

  return (
    !!item &&
    typeof item.id === 'string' &&
    typeof item.type === 'string' &&
    isInt(item.x) &&
    isInt(item.y) &&
    isInt(item.w) &&
    isInt(item.h)
  );
};

const read = (userId: string): TDashboardItem[] | null => {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const parsed: unknown = raw ? JSON.parse(raw) : null;

    return Array.isArray(parsed) ? parsed.filter(isItem).slice(0, DASHBOARD_MAX_ITEMS) : null;
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
