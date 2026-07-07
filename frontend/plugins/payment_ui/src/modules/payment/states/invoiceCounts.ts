import { atom } from 'jotai';

/** Total number of invoices matching the active filters; null while loading. */
export const invoicesTotalCountAtom = atom<number | null>(null);
