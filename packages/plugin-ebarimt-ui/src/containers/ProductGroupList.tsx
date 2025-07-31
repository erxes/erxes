import { gql, useMutation, useQuery } from "@apollo/client";
import { Alert, Bulk, router } from "@erxes/ui/src";
import React from "react";
import ProductGroupsList from "../components/ProductGroupList";
import { mutations, queries } from "../graphql";
import { ProductGroupsCountQueryResponse, ProductGroupsQueryResponse, ProductGroupsRemoveMutationResponse } from "../types";

type Props = {
  queryParams: any;
};

const ProductGroupsContainer = (props: Props) => {
  const { queryParams } = props;

  const productGroupsQuery = useQuery<ProductGroupsQueryResponse>(gql(queries.ebarimtProductGroups), {
    variables: {
      ...router.generatePaginationParams(queryParams || {}),
      searchValue: queryParams.searchValue,
      productId: queryParams.productId,
      status: queryParams.status,
      sortField: queryParams.sortField,
      sortDirection: queryParams.sortDirection
        ? parseInt(queryParams.sortDirection, 10)
        : undefined,
    },
    fetchPolicy: "network-only",
  });

  const productGroupsCountQuery = useQuery<ProductGroupsCountQueryResponse>(gql(queries.ebarimtProductGroupsCount), {
    variables: {
      productId: queryParams.productId,
      searchValue: queryParams.searchValue,
      status: queryParams.status,
    },
    fetchPolicy: "network-only",
  });

  const [productGroupsRemove] = useMutation<ProductGroupsRemoveMutationResponse>(
    gql(mutations.ebarimtProductGroupsRemove),
    generateOptions()
  );

  const removeProductGroups = ({ ids }, emptyBulk) => {
    productGroupsRemove({
      variables: { ids },
    })
      .then(() => {
        emptyBulk();
        Alert.success("You successfully deleted a group");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const ProductGroups = (bulkProps) => {
    const list = productGroupsQuery?.data?.ebarimtProductGroups || [];
    const totalCount = productGroupsCountQuery?.data?.ebarimtProductGroupsCount || 0;

    const updatedProps = {
      ...props,
      totalCount,
      productGroups: list,
      loading: productGroupsQuery.loading || productGroupsCountQuery.loading,
      remove: removeProductGroups,
    };

    return <ProductGroupsList {...updatedProps} {...bulkProps} />;
  };

  const refetch = () => {
    productGroupsQuery.refetch();
    productGroupsCountQuery.refetch();
  };

  return <Bulk content={ProductGroups} refetch={refetch} />;
};

const generateOptions = () => ({
  refetchQueries: [
    "ebarimtProductGroups",
    "ebarimtProductGroupsCount",
  ],
});

export default ProductGroupsContainer;
