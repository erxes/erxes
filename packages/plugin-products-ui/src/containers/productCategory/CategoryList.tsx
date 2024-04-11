import * as compose from "lodash.flowright";

import { Alert, confirm, withProps } from "@erxes/ui/src/utils";
import {
  ProductCategoriesCountQueryResponse,
  ProductCategoryRemoveMutationResponse,
} from "../../types";
import { mutations, queries } from "../../graphql";

import { BrandsQueryResponse } from "@erxes/ui/src/brands/types";
import List from "../../components/productCategory/CategoryList";
import { ProductCategoriesQueryResponse } from "@erxes/ui-products/src/types";
import React from "react";
import { queries as brandQueries } from "@erxes/ui/src/brands/graphql";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";

type Props = { queryParams: any };

type FinalProps = {
  productCategoriesQuery: ProductCategoriesQueryResponse;
  productCategoriesCountQuery: ProductCategoriesCountQueryResponse;
  brandsQuery: BrandsQueryResponse;
} & Props &
  ProductCategoryRemoveMutationResponse;
class ProductListContainer extends React.Component<FinalProps> {
  render() {
    const {
      productCategoriesQuery,
      productCategoriesCountQuery,
      productCategoryRemove,
    } = this.props;

    const remove = (productId) => {
      confirm().then(() => {
        productCategoryRemove({
          variables: { _id: productId },
        })
          .then(() => {
            productCategoriesQuery.refetch();
            productCategoriesCountQuery.refetch();

            Alert.success(
              `You successfully deleted a product & service category`
            );
          })
          .catch((error) => {
            Alert.error(error.message);
          });
      });
    };

    const { brandsQuery } = this.props;
    const brands = (brandsQuery ? brandsQuery.brands : []) || [];
    const brandsLoading = (brandsQuery && brandsQuery.loading) || false;

    const productCategories = productCategoriesQuery.productCategories || [];

    const updatedProps = {
      ...this.props,
      remove,
      productCategories,
      loading: productCategoriesQuery.loading,
      productCategoriesCount:
        productCategoriesCountQuery.productCategoriesTotalCount || 0,
      brands,
      brandsLoading,
    };

    return <List {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ["productCategories", "productCategoriesTotalCount", "products"];
};

const options = () => ({
  refetchQueries: getRefetchQueries(),
});

export default withProps<Props>(
  compose(
    graphql<Props, ProductCategoriesQueryResponse, { parentId: string }>(
      gql(queries.productCategories),
      {
        name: "productCategoriesQuery",
        options: ({ queryParams }) => ({
          variables: {
            status: queryParams.status,
            brand: queryParams.brand,
            parentId: queryParams.parentId,
          },
          refetchQueries: getRefetchQueries(),
          fetchPolicy: "network-only",
        }),
      }
    ),
    graphql<Props, ProductCategoriesCountQueryResponse>(
      gql(queries.productCategoriesCount),
      {
        name: "productCategoriesCountQuery",
      }
    ),
    graphql<Props, ProductCategoryRemoveMutationResponse, { _id: string }>(
      gql(mutations.productCategoryRemove),
      {
        name: "productCategoryRemove",
        options,
      }
    ),
    graphql<Props, BrandsQueryResponse, {}>(gql(brandQueries.brands), {
      name: "brandsQuery",
    })
  )(ProductListContainer)
);
