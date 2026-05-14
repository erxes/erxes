import { atom } from 'jotai';
import { IProductGroup } from '@/ebarimt/settings/product-group/constants/productGroupDefaultValues';

export const productGroupDetailAtom = atom<IProductGroup | null>(null);
