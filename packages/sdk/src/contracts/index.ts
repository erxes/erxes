import type { Contract } from './define';
import { salesContract } from './sales';

export { defineContract } from './define';
export type { Contract, ContractClient, ContractEntry } from './define';
export { salesContract } from './sales';

// Every contract the runtime serves, by host and version. A new version is a
// new key next to the old one, never a replacement.
export const contracts = {
  sales: { 1: salesContract },
};

export type Contracts = typeof contracts;

// What an extension pins: host -> one served version of it.
export type Uses = {
  [H in keyof Contracts]?: keyof Contracts[H] & number;
};

const served: Record<string, Record<number, Contract> | undefined> = contracts;

export const findContract = (host: string, version: number) =>
  served[host]?.[version];
