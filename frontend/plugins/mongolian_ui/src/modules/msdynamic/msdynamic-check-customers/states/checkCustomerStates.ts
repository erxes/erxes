import { atom } from 'jotai';
import {
  ICustomerItem,
  CustomerStatus,
  ICheckCustomerResponse,
} from '../types/checkCustomer';

export const customerItemsAtom = atom<ICustomerItem[]>([]);
export const customerCheckResponseAtom = atom<ICheckCustomerResponse | null>(
  null,
);
export const customerFilterAtom = atom<CustomerStatus | null>('CREATE');
export const customerCheckingAtom = atom(false);
export const customerSyncingAtom = atom(false);
