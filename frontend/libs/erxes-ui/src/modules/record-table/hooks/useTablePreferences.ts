import { useState, useCallback } from 'react';

export interface TablePrefs {
  columnOrder?: string[];
  columnSizing?: Record<string, number>;
  columnVisibility?: Record<string, boolean>;
}

export const useTablePreferences = (tableId: string | undefined) => {
  const fetchStorage = () => {
    if (!tableId) return {};
    try {
      const prefs = localStorage.getItem(`erxes_table_prefs_${tableId}`);
      return prefs ? JSON.parse(prefs) : {};
    } catch (e) {
      console.error(e);
      return {};
    }
  };

  const [prefs, setPrefs] = useState<TablePrefs>(fetchStorage);

  const savePrefs = useCallback(
    (updates: Partial<TablePrefs>) => {
      if (!tableId) return;
      try {
        setPrefs((currentPrefs) => {
          const merged = { ...currentPrefs, ...updates };
          localStorage.setItem(
            `erxes_table_prefs_${tableId}`,
            JSON.stringify(merged),
          );
          return merged;
        });
      } catch (e) {
        console.error(e);
      }
    },
    [tableId],
  );

  return { prefs, savePrefs };
};
