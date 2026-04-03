import { atom } from 'jotai';
import { IProductRulesOnTax } from '@/ebarimt/settings/product-rules-on-tax/constants/productRulesOnTaxDefaultValues';

export const productRulesOnTaxDetailAtom = atom<IProductRulesOnTax | null>(
  null,
);
