import { useQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { productRulesOnTaxDetailAtom } from '@/ebarimt/settings/product-rules-on-tax/states/productRulesOnTaxRowStates';

export const useProductRulesOnTaxRowDetail = () => {
  const [productRulesOnTaxId, setProductRulesOnTaxId] = useQueryState<string>(
    'product_rules_on_tax_id',
  );
  const productRulesOnTaxDetail = useAtomValue(productRulesOnTaxDetailAtom);
  const hasDetail =
    !!productRulesOnTaxId &&
    productRulesOnTaxDetail?._id === productRulesOnTaxId;

  // The detail only comes from the clicked row (the API has no single-rule
  // query), so a reloaded or shared edit link has nothing to show.
  useEffect(() => {
    if (productRulesOnTaxId && !hasDetail) {
      setProductRulesOnTaxId(null);
    }
  }, [productRulesOnTaxId, hasDetail, setProductRulesOnTaxId]);

  return {
    productRulesOnTaxDetail: hasDetail ? productRulesOnTaxDetail : undefined,
    loading: false,
    closeDetail: () => setProductRulesOnTaxId(null),
  };
};
