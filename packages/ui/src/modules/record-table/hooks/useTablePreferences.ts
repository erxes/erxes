import { useCallback, useState } from 'react';
import { z } from 'zod';
import { jsonOf } from 'erxes-ui/utils/json';

const ids = z.array(z.string());

const tablePrefsSchema = z.object({
  columnOrder: ids.optional(),
  // Strict: a layout saved with the older left/right pinning reads as none, not as unpinned.
  columnPinning: z.strictObject({ start: ids, end: ids }).optional(),
  columnSizing: z.record(z.string(), z.number()).optional(),
  columnVisibility: z.record(z.string(), z.boolean()).optional(),
  /** The columns meant to stick when the pinning was saved (a newly sticky column is pinned once). */
  stickyColumns: ids.optional(),
});

type TablePrefs = z.infer<typeof tablePrefsSchema>;

const storageKey = (tableId: string) => `erxes_table_prefs_${tableId}`;

/** The saved layout; storage that is blocked, missing or malformed reads as none. */
const readPrefs = (tableId: string | undefined): TablePrefs => {
  if (!tableId) return {};

  try {
    return jsonOf(tablePrefsSchema).safeParse(localStorage.getItem(storageKey(tableId))).data ?? {};
  } catch {
    // localStorage itself throws when storage is blocked.
    return {};
  }
};

const writePrefs = (tableId: string, prefs: TablePrefs) => {
  try {
    localStorage.setItem(storageKey(tableId), JSON.stringify(prefs));
  } catch {
    // Storage is full or blocked: the layout lasts for this page only.
  }
};

/** A table's column layout, kept in localStorage per `tableId`; without one nothing is kept. */
export const useTablePreferences = (tableId: string | undefined) => {
  const [prefs, setPrefs] = useState(() => readPrefs(tableId));

  const savePrefs = useCallback(
    (updates: Partial<TablePrefs>) => {
      if (!tableId) return;

      setPrefs((current) => {
        const merged = { ...current, ...updates };

        writePrefs(tableId, merged);

        return merged;
      });
    },
    [tableId],
  );

  return { prefs, savePrefs };
};
