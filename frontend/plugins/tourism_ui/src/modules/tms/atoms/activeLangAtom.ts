import { atomWithStorage } from 'jotai/utils';

export const activeLangAtom = atomWithStorage<string>('tms:activeLang', '');
