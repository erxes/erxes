import { atom } from 'jotai';

export type TPosCustomerFormEdit =
  | { posId: string; kind: 'field'; fieldId: string }
  | { posId: string; kind: 'layout'; layout: string[][] | null };

export const posCustomerFormEditAtom = atom<TPosCustomerFormEdit | null>(null);
