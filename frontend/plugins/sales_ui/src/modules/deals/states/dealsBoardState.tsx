import { ActiveDragItem, BoardDealColumn } from '@/deals/types/boards';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

import { BoardItemProps } from 'erxes-ui';
import { IDeal } from '@/deals/types/deals';
import { SetStateAction } from 'react';

export interface BoardState<TItem, TColumn> {
  columns: TColumn[];
  items: Record<string, TItem>;
  columnItems: Record<string, string[]>;
}

export type DealsBoardState = BoardState<IDeal, BoardDealColumn>;

export const fetchedDealsState = atom<BoardItemProps[]>([]);
export const allDealsMapState = atom<Record<string, IDeal>>({});
export const isDraggingAtom = atom<boolean>(false);
export const isActiveItem = atom<ActiveDragItem | null>(null);
export const dealsBoardAtom = atom<DealsBoardState | null>(null);
export const dealCountByColumnAtom = atom<Record<string, number>>({});

export function useDealsBoard(): [
  DealsBoardState | null,
  (value: SetStateAction<DealsBoardState | null>) => void,
] {
  const [state, setState] = useAtom(dealsBoardAtom);
  return [state, setState];
}

export function useDealsIsDragging(): [
  boolean,
  (value: SetStateAction<boolean>) => void,
] {
  const [isDragging, setIsDragging] = useAtom(isDraggingAtom);
  return [isDragging, setIsDragging];
}

export function useAllDealsMap(): [
  Record<string, IDeal>,
  (value: SetStateAction<Record<string, IDeal>>) => void,
] {
  const value = useAtomValue(allDealsMapState);
  const setValue = useSetAtom(allDealsMapState);
  return [value, setValue];
}

export function useDealCountByColumn(): [
  Record<string, number>,
  (value: SetStateAction<Record<string, number>>) => void,
] {
  const [counts, setCounts] = useAtom(dealCountByColumnAtom);
  return [counts, setCounts];
}
