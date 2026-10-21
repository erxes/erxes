import { useQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { productRulesOnTaxDetailAtom } from '@/ebarimt/settings/product-rules-on-tax/states/productRulesOnTaxRowStates';

export const useProductRulesOnTaxRowDetail = () => {
  const [productRulesOnTaxId, setProductRulesOnTaxId] = useQueryState<string>(
    'product_rules_on_tax_id',
  );
  const productRulesOnTaxDetail = useAtomValue(productRulesOnTaxDetailAtom);

  return {
    productRulesOnTaxDetail:
      productRulesOnTaxDetail?._id === productRulesOnTaxId
        ? productRulesOnTaxDetail
        : undefined,
    loading: false,
    closeDetail: () => setProductRulesOnTaxId(null),
  };
};
