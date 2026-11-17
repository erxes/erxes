import {
  automationsListLayoutState,
  TAutomationsListLayout,
} from '@/automations/states/automationsListLayoutState';
import { useMultiQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';

const parseLayout = (value?: string | null): TAutomationsListLayout | null =>
  value === 'grid' || value === 'list' ? value : null;

/**
 * A `layout` query param wins so a shared link opens the way it was sent;
 * otherwise the stored preference applies, which is what survives navigating
 * into an automation and back.
 */
export const useAutomationsListLayout = () => {
  const [queryParams, setQueryParams] = useMultiQueryState<{ layout: string }>([
    'layout',
  ]);
  const [storedLayout, setStoredLayout] = useAtom(automationsListLayoutState);
  const paramLayout = parseLayout(queryParams.layout);

  // Adopt a link's layout so leaving and coming back keeps showing it
  useEffect(() => {
    if (paramLayout && paramLayout !== storedLayout) {
      setStoredLayout(paramLayout);
    }
  }, [paramLayout, storedLayout, setStoredLayout]);

  const setLayout = useCallback(
    (next: TAutomationsListLayout) => {
      setStoredLayout(next);
      // Keep the default layout out of the URL
      setQueryParams({ layout: next === 'list' ? null : next });
    },
    [setStoredLayout, setQueryParams],
  );

  return { layout: paramLayout ?? storedLayout, setLayout };
};

/** The display popover: choosing a layout closes it. */
export const useAutomationsDisplayControl = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { layout, setLayout } = useAutomationsListLayout();

  const handleValueChange = useCallback(
    (value: string) => {
      const next = parseLayout(value);

      if (next) {
        setLayout(next);
        setIsOpen(false);
      }
    },
    [setLayout],
  );

  return { isOpen, setIsOpen, layout, handleValueChange };
};
