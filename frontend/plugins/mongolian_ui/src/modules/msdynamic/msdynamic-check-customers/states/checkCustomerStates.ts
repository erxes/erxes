import { atom } from 'jotai';
import { ICustomerItem, CustomerStatus } from '../types/checkCustomer';

export const customerItemsAtom = atom<ICustomerItem[]>([]);
export const customerCheckResponseAtom = atom<{
  update: { items: ICustomerItem[] };
  create: { items: ICustomerItem[] };
  delete: { items: ICustomerItem[] };
} | null>(null);
export const customerFilterAtom = atom<CustomerStatus | null>('CREATE');
export const customerCheckingAtom = atom(false);
export const customerSyncingAtom = atom(false);
