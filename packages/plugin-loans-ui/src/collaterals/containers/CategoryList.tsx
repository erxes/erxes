import { ProductCategoriesQueryResponse } from "@erxes/ui-products/src/types";
import { queries } from "@erxes/ui-products/src/graphql";
import { gql } from "@apollo/client";
import React from "react";
import { useQuery } from "@apollo/client";

import List from "../components/CategoryList";

type Props = { queryParams: any };

const CollateralListContainer = (props: Props) => {
  const productCategoriesQuery = useQuery<ProductCategoriesQueryResponse>(
    gql(queries.productCategories),
    {
      fetchPolicy: "network-only",
    }
  );

  const collateralCategories =
    productCategoriesQuery?.data?.productCategories || [];

  const updatedProps = {
    ...props,
    refetch: productCategoriesQuery.refetch,
    collateralCategories,
    collateralCategoriesCount: collateralCategories.length,
    loading: productCategoriesQuery.loading,
  };

  return <List {...updatedProps} />;
};

export default CollateralListContainer;
