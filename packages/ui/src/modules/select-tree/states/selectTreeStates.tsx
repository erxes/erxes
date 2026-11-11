import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export const hideChildrenAtomFamily = atomFamily((key: string) => atom<string[]>([]));

