import { gql, useMutation, useQuery } from "@apollo/client";
import { Alert, Bulk, router } from "@erxes/ui/src";
import React from "react";
import ProductRulesList from "../components/ProductRuleList";
import { mutations, queries } from "../graphql";
import { ProductRulesCountQueryResponse, ProductRulesQueryResponse, ProductRulesRemoveMutationResponse } from "../types";

type Props = {
  queryParams: any;
};

const ProductRulesContainer = (props: Props) => {
  const { queryParams } = props;

  const productRulesQuery = useQuery<ProductRulesQueryResponse>(gql(queries.ebarimtProductRules), {
    variables: {
      ...router.generatePaginationParams(queryParams || {}),
      productId: queryParams.productId,
      searchValue: queryParams.searchValue,
      kind: queryParams.kind,
      taxCode: queryParams.taxCode,
      taxType: queryParams.taxType,
      sortField: queryParams.sortField,
      sortDirection: queryParams.sortDirection
        ? parseInt(queryParams.sortDirection, 10)
        : undefined,
    },
    fetchPolicy: "network-only",
  });

  const productRulesCountQuery = useQuery<ProductRulesCountQueryResponse>(gql(queries.ebarimtProductRulesCount), {
    variables: {
      productId: queryParams.productId,
      searchValue: queryParams.searchValue,
      kind: queryParams.kind,
      taxCode: queryParams.taxCode,
      taxType: queryParams.taxType,
    },
    fetchPolicy: "network-only",
  });

  const [productRulesRemove] = useMutation<ProductRulesRemoveMutationResponse>(
    gql(mutations.ebarimtProductRulesRemove),
    generateOptions()
  );

  const removeProductRules = ({ ids }, emptyBulk) => {
    productRulesRemove({
      variables: { ids },
    })
      .then(() => {
        emptyBulk();
        Alert.success("You successfully deleted a rule");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const ProductRules = (bulkProps) => {
    const list = productRulesQuery?.data?.ebarimtProductRules || [];
    const totalCount = productRulesCountQuery?.data?.ebarimtProductRulesCount || 0;

    const updatedProps = {
      ...props,
      totalCount,
      productRules: list,
      loading: productRulesQuery.loading || productRulesCountQuery.loading,
      remove: removeProductRules,
    };

    return <ProductRulesList {...updatedProps} {...bulkProps} />;
  };

  const refetch = () => {
    productRulesQuery.refetch();
    productRulesCountQuery.refetch();
  };

  return <Bulk content={ProductRules} refetch={refetch} />;
};

const generateOptions = () => ({
  refetchQueries: [
    "ebarimtProductRules",
    "ebarimtProductRulesCount",
  ],
});

export default ProductRulesContainer;
