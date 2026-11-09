import type { ProductsDraft } from '@/deals/cards/components/detail/product/utils/productsDraft';
import type { IPaymentsData } from '@/deals/types/deals';
import { atom, PrimitiveAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export const dealProductsDraftAtomFamily = atomFamily((_dealId: string) =>
  atom<ProductsDraft | null>(null),
);

export const dealProductsDraftRevisionAtomFamily = atomFamily(
  (_dealId: string) => atom(0),
);

export const dealPaymentsDraftAtomFamily = atomFamily<
  string,
  PrimitiveAtom<IPaymentsData | null>
>(() => atom<IPaymentsData | null>(null));

export const dealPaymentsDraftRevisionAtomFamily = atomFamily<
  string,
  PrimitiveAtom<number>
>(() => atom(0));

export const removeDealProductsDraft = (dealId: string) => {
  dealProductsDraftAtomFamily.remove(dealId);
  dealProductsDraftRevisionAtomFamily.remove(dealId);
  dealPaymentsDraftAtomFamily.remove(dealId);
  dealPaymentsDraftRevisionAtomFamily.remove(dealId);
};
