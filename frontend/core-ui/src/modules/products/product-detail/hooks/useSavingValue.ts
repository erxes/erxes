import { useEffect, useRef, useState } from 'react';

/**
 * Shows a change at once and saves it; the saved value replaces it once
 * stored, and a failed save puts the saved value back. While saves are
 * pending the newest change is shown: an older save's result is out of date.
 */
export const useSavingValue = <T>(
  saved: T,
  save: (value: T) => Promise<unknown>,
) => {
  const [value, setValue] = useState(saved);
  const latestSaved = useRef(saved);
  latestSaved.current = saved;
  const pending = useRef(0);

  useEffect(() => {
    if (!pending.current) setValue(saved);
  }, [saved]);

  const change = (next: T) => {
    setValue(next);
    pending.current += 1;
    const settle = (result: unknown) => {
      pending.current -= 1;
      if (!pending.current && !result) setValue(latestSaved.current);
    };
    save(next).then(settle, () => settle(null));
  };

  return [value, change] as const;
};
