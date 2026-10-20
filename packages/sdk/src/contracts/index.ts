import { accountingContract } from './accounting';
import { contentContract } from './content';
import { coreContract } from './core';
import type { Contract } from './define';
import { frontlineContract } from './frontline';
import { loyaltyContract } from './loyalty';
import { mongolianContract } from './mongolian';
import { operationContract } from './operation';
import { paymentContract } from './payment';
import { salesContract } from './sales';
import { tourismContract } from './tourism';

export { defineContract, toDocument } from './define';
export type { Contract, ContractClient, ContractEntry } from './define';

// Every contract the runtime serves, by host and version. A new version is a
// new key next to the old one, never a replacement. Additive changes (a new
// entry, a new optional input field, a new output field) may extend a
// version; anything that would break an extension written against it ships as
// the next version, and the old one stays served while any install pins it.
// insurance isn't here: none of its resolvers checks login yet.
export const contracts = {
  accounting: { 1: accountingContract },
  content: { 1: contentContract },
  core: { 1: coreContract },
  frontline: { 1: frontlineContract },
  loyalty: { 1: loyaltyContract },
  mongolian: { 1: mongolianContract },
  operation: { 1: operationContract },
  payment: { 1: paymentContract },
  sales: { 1: salesContract },
  tourism: { 1: tourismContract },
};

export type Contracts = typeof contracts;

// What an extension pins: host -> one served version of it.
export type Uses = {
  [H in keyof Contracts]?: keyof Contracts[H] & number;
};

const served: Record<string, Record<number, Contract> | undefined> = contracts;

export const findContract = (host: string, version: number) =>
  served[host]?.[version];
