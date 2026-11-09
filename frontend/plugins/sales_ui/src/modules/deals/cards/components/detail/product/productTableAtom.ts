import type { ProductsDraft } from '@/deals/cards/components/detail/product/utils/productsDraft';
import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export const dealProductsDraftAtomFamily = atomFamily((_dealId: string) =>
  atom<ProductsDraft | null>(null),
);

export const dealProductsDraftRevisionAtomFamily = atomFamily(
  (_dealId: string) => atom(0),
);

export const removeDealProductsDraft = (dealId: string) => {
  dealProductsDraftAtomFamily.remove(dealId);
  dealProductsDraftRevisionAtomFamily.remove(dealId);
};
