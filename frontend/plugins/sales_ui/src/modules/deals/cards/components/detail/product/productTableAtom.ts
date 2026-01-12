import { atom } from 'jotai';
import { IProductData } from 'ui-modules';

type OnLocalChangeType = (id: string, patch: Partial<IProductData>) => void;

export const onLocalChangeAtom = atom<OnLocalChangeType | null>(null);
