import { atom } from 'jotai';

export type GatewayBankKey = 'golomt' | 'khanbank' | 'tdb';

export type GatewaySelectionEntry = {
  ids: string[];
  removeConfig: (_id: string) => Promise<any>;
  resetSelection: () => void;
};

export const gatewaySelectionAtom = atom<
  Partial<Record<GatewayBankKey, GatewaySelectionEntry>>
>({});
