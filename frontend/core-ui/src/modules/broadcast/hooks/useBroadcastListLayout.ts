import { useMultiQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import {
  broadcastListLayoutState,
  TBroadcastListLayout,
} from '../states/broadcastListLayoutState';

const LAYOUTS: TBroadcastListLayout[] = ['list', 'grid', 'calendar'];

export const parseLayout = (
  value?: string | null,
): TBroadcastListLayout | null =>
  LAYOUTS.includes(value as TBroadcastListLayout)
    ? (value as TBroadcastListLayout)
    : null;

/**
 * A `layout` query param wins so a shared link opens the way it was sent;
 * otherwise the stored preference applies, which is what survives opening a
 * campaign and closing it again.
 */
export const useBroadcastListLayout = () => {
  const [queryParams, setQueryParams] = useMultiQueryState<{ layout: string }>([
    'layout',
  ]);
  const [storedLayout, setStoredLayout] = useAtom(broadcastListLayoutState);

  const paramLayout = parseLayout(queryParams.layout);
  const layout = paramLayout ?? storedLayout;
  const seen = useRef<TBroadcastListLayout | null | undefined>(undefined);

  /**
   * Adopt a link's layout so leaving and coming back keeps showing it.
   *
   * Only a param that has just changed counts as a choice arriving from
   * outside. One that merely differs from the stored layout is the URL still
   * catching up with a switch made here a moment ago — adopting that put the
   * old layout straight back, which is why the first click only ever closed
   * the popover.
   */
  useEffect(() => {
    const isFirstRead = seen.current === undefined;
    const changed = seen.current !== paramLayout;

    seen.current = paramLayout;

    if (paramLayout && (isFirstRead || changed)) {
      setStoredLayout(paramLayout);
    }
  }, [paramLayout, setStoredLayout]);

  const setLayout = (next: TBroadcastListLayout) => {
    setStoredLayout(next);
    // Keep the default layout out of the URL
    setQueryParams({ layout: next === 'list' ? null : next });
  };

  return { layout, setLayout };
};
