import { useQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useQuery } from '@apollo/client';
import { productRulesOnTaxDetailAtom } from '@/ebarimt/settings/product-rules-on-tax/states/productRulesOnTaxRowStates';
import { GET_PRODUCT_RULES_ON_TAX } from '@/ebarimt/settings/product-rules-on-tax/graphql/queries/getProductRulesOnTax';

export const useProductRulesOnTaxRowDetail = () => {
  const [productRulesOnTaxId, setProductRulesOnTaxId] = useQueryState<string>(
    'product_rules_on_tax_id',
  );
  const productRulesOnTaxDetail = useAtomValue(productRulesOnTaxDetailAtom);
  const { data, loading } = useQuery(GET_PRODUCT_RULES_ON_TAX, {
    variables: { id: productRulesOnTaxId },
    skip: !!productRulesOnTaxDetail || !productRulesOnTaxId,
  });

  return {
    productRulesOnTaxDetail:
      productRulesOnTaxDetail &&
      productRulesOnTaxDetail?._id === productRulesOnTaxId
        ? productRulesOnTaxDetail
        : data?.productRulesOnTaxDetail,
    loading,
    closeDetail: () => setProductRulesOnTaxId(null),
  };
};
