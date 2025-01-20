import * as compose from "lodash.flowright";

import { Alert, withProps } from "@erxes/ui/src/utils";
import {
  CategoryDetailQueryResponse,
  MergeMutationResponse,
  MergeMutationVariables,
  ProductDuplicateMutationResponse,
  ProductRemoveMutationResponse,
  ProductsCountQueryResponse,
  ProductsQueryResponse,
} from "../../types";
import { mutations, queries } from "../../graphql";

import Bulk from "@erxes/ui/src/components/Bulk";
import List from "../../components/product/ProductList";
import React, { useState } from "react";
import { generatePaginationParams } from "@erxes/ui/src/utils/router";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
  type?: string;
};

type FinalProps = {
  productsQuery: ProductsQueryResponse;
  productsCountQuery: ProductsCountQueryResponse;
  productCategoryDetailQuery: CategoryDetailQueryResponse;
} & Props &
  ProductRemoveMutationResponse &
  MergeMutationResponse &
  ProductDuplicateMutationResponse;

const ProductListContainer = (props: FinalProps) => {
  const [mergeProductLoading, setMergeProductLoading] = useState(false);
  const navigate = useNavigate();

  const {
    productsQuery,
    productsCountQuery,
    productsRemove,
    productsMerge,
    queryParams,
    productCategoryDetailQuery,
    productsDuplicate,
  } = props;

  const products = productsQuery.products || [];

  // remove action
  const remove = ({ productIds }, emptyBulk) => {
    productsRemove({
      variables: { productIds },
    })
      .then((removeStatus) => {
        emptyBulk();

        const status = removeStatus.data.productsRemove;

        status === "deleted"
          ? Alert.success("You successfully deleted a product")
          : Alert.warning("Product status deleted");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const mergeProducts = ({ ids, data, callback }) => {
    setMergeProductLoading(true);

    productsMerge({
      variables: {
        productIds: ids,
        productFields: data,
      },
    })
      .then((result: any) => {
        callback();
        setMergeProductLoading(false);
        Alert.success("You successfully merged a product");
        navigate(
          `/settings/product-service/details/${result.data.productsMerge._id}`
        );
      })
      .catch((e) => {
        Alert.error(e.message);
        setMergeProductLoading(false);
      });
  };

  const duplicateProduct = (_id: string) => {
    productsDuplicate({
      variables: { _id },
    })
      .then((result: any) => {
        Alert.success("You successfully duplicated a product");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const searchValue = props.queryParams.searchValue || "";

  const updatedProps = {
    ...props,
    queryParams,
    products,
    remove,
    loading: productsQuery.loading || productsCountQuery.loading,
    searchValue,
    productsCount: productsCountQuery.productsTotalCount || 0,
    currentCategory: productCategoryDetailQuery.productCategoryDetail || {},
    mergeProducts,
    duplicateProduct
  };

  const productList = (props) => {
    return <List {...updatedProps} {...props} />;
  };

  const refetch = () => {
    props.productsQuery.refetch();
  };

  return <Bulk content={productList} refetch={refetch} />;
};

const getRefetchQueries = () => {
  return [
    "products",
    "productCategories",
    "productCategoriesCount",
    "productsTotalCount",
    "productCountByTags",
  ];
};

const options = () => ({
  refetchQueries: getRefetchQueries(),
});

export default withProps<Props>(
  compose(
    graphql<Props, ProductsQueryResponse, { page: number; perPage: number }>(
      gql(queries.products),
      {
        name: "productsQuery",
        options: ({ queryParams }) => ({
          variables: {
            categoryId: queryParams.categoryId,
            status: queryParams.state,
            tag: queryParams.tag,
            brand: queryParams.brand,
            searchValue: queryParams.searchValue,
            type: queryParams.type,
            segment: queryParams.segment,
            segmentData: queryParams.segmentData,
            image: queryParams.image,
            ids: queryParams.ids && queryParams.ids.split(","),
            ...generatePaginationParams(queryParams),
          },
          fetchPolicy: "network-only",
        }),
      }
    ),
    graphql<Props, ProductsCountQueryResponse>(gql(queries.productsCount), {
      name: "productsCountQuery",
      options: ({ queryParams }) => ({
        variables: {
          categoryId: queryParams.categoryId,
          status: queryParams.state,
          tag: queryParams.tag,
          searchValue: queryParams.searchValue,
          type: queryParams.type,
          segment: queryParams.segment,
          segmentData: queryParams.segmentData,
          image: queryParams.image,
          ids: queryParams.ids && queryParams.ids.split(","),
        },
        fetchPolicy: "network-only",
      }),
    }),
    graphql<Props, ProductRemoveMutationResponse, { productIds: string[] }>(
      gql(mutations.productsRemove),
      {
        name: "productsRemove",
        options,
      }
    ),
    graphql<Props, CategoryDetailQueryResponse>(
      gql(queries.productCategoryDetail),
      {
        name: "productCategoryDetailQuery",
        options: ({ queryParams }) => ({
          variables: {
            _id: queryParams.categoryId,
          },
        }),
      }
    ),
    graphql<Props, MergeMutationResponse, MergeMutationVariables>(
      gql(mutations.productsMerge),
      {
        name: "productsMerge",
      }
    ),
    graphql<Props, ProductDuplicateMutationResponse, { _id: string }>(
      gql(mutations.productsDuplicate),
      {
        name: "productsDuplicate",
        options,
      }
    )
  )(ProductListContainer)
);
