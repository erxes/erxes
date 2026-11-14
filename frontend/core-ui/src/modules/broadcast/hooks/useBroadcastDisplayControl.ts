import { useCallback, useState } from 'react';
import { parseLayout, useBroadcastListLayout } from './useBroadcastListLayout';

/** The display popover: picking a layout applies it and closes the popover. */
export const useBroadcastDisplayControl = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { layout, setLayout } = useBroadcastListLayout();

  const selectLayout = useCallback(
    (value: string) => {
      const next = parseLayout(value);

      if (next) {
        setLayout(next);
        setIsOpen(false);
      }
    },
    [setLayout],
  );

  return { isOpen, setIsOpen, layout, selectLayout };
};
