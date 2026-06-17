import { atom } from 'jotai';
import { ETabVariant } from '../components/nav/types';

export const messengerTabVariantAtom = atom<ETabVariant>(ETabVariant.FLUID);
