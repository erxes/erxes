import { QueryHookOptions, useQuery, gql } from '@apollo/client';

export interface IPosInline {
  _id: string;
  name: string;
  code: string;
}

export interface IPosInlineQuery {
  posDetail: IPosInline;
}

const POS_DETAIL_QUERY = gql`
  query salesPosItemsInlineDetail($_id: String!) {
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
`;

export const usePosInline = (options?: QueryHookOptions<IPosInlineQuery>) => {
  const { data, loading, error } = useQuery<IPosInlineQuery>(POS_DETAIL_QUERY, {
    ...options,
  });

  return {
    posDetail: data?.posDetail,
    loading,
    error,
  };
};
