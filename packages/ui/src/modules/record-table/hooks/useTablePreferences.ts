import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { z } from 'zod';
import { storedFamily } from 'erxes-ui/lib/stored';

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

const tablePrefsState = storedFamily({
  key: 'erxes:table:prefs',
  schema: tablePrefsSchema,
  initial: {},
});

/** A table's column layout, kept in this browser per `tableId`; without one nothing is kept. */
export const useTablePreferences = (tableId: string | undefined) => {
  const [prefs, setPrefs] = useAtom(tablePrefsState(tableId ?? ''));

  const savePrefs = useCallback(
    (updates: Partial<TablePrefs>) => {
      if (tableId) setPrefs((current) => ({ ...current, ...updates }));
    },
    [tableId, setPrefs],
  );

  return { prefs: tableId ? prefs : {}, savePrefs };
};
