import { useCallback, useEffect, useState } from 'react';
import {
  findQzPrinters,
  isQzActive,
} from 'ui-modules/modules/documents/utils/qzTray';

export const useQzPrinters = (enabled: boolean) => {
  const [printers, setPrinters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setLoading(true);

    try {
      const found = await findQzPrinters();

      setPrinters(found);
      setConnected(true);
    } catch {
      setPrinters([]);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setPrinters([]);
      setConnected(isQzActive());
      return;
    }

    refresh();
  }, [enabled, refresh]);

  return { printers, loading, connected, refresh };
};
