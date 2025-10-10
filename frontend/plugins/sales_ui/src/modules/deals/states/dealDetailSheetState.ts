import { atom, useAtom } from 'jotai';
import { useEffect, useRef } from 'react';

import { useSearchParams } from 'react-router';

const baseDealDetailSheetAtom = atom<string | null>(null);

export const dealDetailSheetState = atom(
  (get) => get(baseDealDetailSheetAtom), 
  (get, set, newId: string | null) => {
    set(baseDealDetailSheetAtom, newId);
  }
);

export const useDealDetailSheetQueryParam = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dealId, setDealId] = useAtom(dealDetailSheetState);

  const initializedRef = useRef(false);

  const setId = (id: string | null) => {
    setDealId(id);

    const newParams = new URLSearchParams(searchParams.toString());
    if (id) newParams.set('dealId', id);
    else newParams.delete('dealId');

    setSearchParams(newParams, { replace: true });
  };

  useEffect(() => {
    if (!initializedRef.current) {
      const id = searchParams.get('dealId');
      if (id && id !== dealId) {
        setDealId(id);
      }
      initializedRef.current = true;
    }
  }, [searchParams, dealId, setDealId]);

  return [dealId, setId] as const;
};
