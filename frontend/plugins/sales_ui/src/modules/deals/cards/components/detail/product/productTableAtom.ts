import type { DealProductData } from '@/deals/utils/dealJson';
import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export const dealProductsDraftAtomFamily = atomFamily((_dealId: string) =>
  atom<Record<string, Partial<DealProductData>> | null>(null),
);
