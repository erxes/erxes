import { atom } from 'jotai';
import { ILoyaltyScore } from '../constants/loyaltyScoreDefaultValues';

export const loyaltyScoreDetailAtom = atom<ILoyaltyScore | null>(null);
