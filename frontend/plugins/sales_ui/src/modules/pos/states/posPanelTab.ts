import { atom } from 'jotai';

export interface IPosPanelTab {
  posId: string;
  tab: string;
}

export const posPanelTabAtom = atom<IPosPanelTab | null>(null);
