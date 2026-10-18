import { hasId } from '@/pos/utils/posJson';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { gql } from '~/gql';

import type {
  SalesPosOrdersInlineDetailQuery,
  SalesPosOrdersInlineDetailQueryVariables,
} from '~/gql/graphql';

const POS_DETAIL_QUERY = gql(`
  query salesPosOrdersInlineDetail($_id: String!) {
    posDetail(_id: $_id) {
      _id
      name
      description
      orderPassword
      scopeBrandIds
      pdomain
      createdAt
      token
      adminIds
      cashierIds
      paymentIds
      paymentTypes
      user {
        _id
        details {
          avatar
          fullName
        }
      }
      isOnline
      onServer
      branchId
      departmentId
      allowBranchIds
      beginNumber
      maxSkipNumber
      waitingScreen
      kitchenScreen
      kioskMachine
      uiOptions
      cardsConfig
      catProdMappings {
        _id
        categoryId
        code
        name
        productId
      }
      initialCategoryIds
      kioskExcludeCategoryIds
      kioskExcludeProductIds
      deliveryConfig
      permissionConfig
      allowTypes
      isShowRemainder
      isCheckRemainder
      checkExcludeCategoryIds
      saveRemainder
      banFractions
      branchTitle
      departmentTitle
    }
  }
`);

export const usePosInline = (
  options?: QueryHookOptions<
    SalesPosOrdersInlineDetailQuery,
    SalesPosOrdersInlineDetailQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(POS_DETAIL_QUERY, {
    ...options,
  });

  return {
    posDetail: hasId(data?.posDetail) ? data.posDetail : undefined,
    loading,
    error,
  };
};
