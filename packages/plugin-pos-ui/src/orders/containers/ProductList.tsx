import { gql, useQuery } from "@apollo/client";
import List from "../components/ProductList";
import React from "react";
import { Bulk, router, Spinner } from "@erxes/ui/src";
import { IQueryParams } from "@erxes/ui/src/types";
import { queries } from "../graphql";
import { FILTER_PARAMS } from "../../constants";
import { generateParams } from "./List";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
  type?: string;
};

const ProductList = (props: Props) => {
  const { type, queryParams } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const posProductsQuery = useQuery(gql(queries.posProducts), {
    variables: genParams({ queryParams } || {}),
    fetchPolicy: "network-only",
  });

  const onSearch = (search: string) => {
    if (!search) {
      return router.removeParams(navigate, location, "search");
    }
    router.removeParams(navigate, location, "page");
    router.setParams(navigate, location, { search });
  };

  const onSelect = (values: string[] | string, key: string) => {
    router.removeParams(navigate, location, "page");
    if (queryParams[key] === values) {
      return router.removeParams(navigate, location, key);
    }

    return router.setParams(navigate, location, { [key]: values });
  };

  const onFilter = (filterParams: IQueryParams) => {
    router.removeParams(navigate, location, "page");

    const setParams: any = {}

    for (const key of new Set([...Object.keys(queryParams), ...Object.keys(filterParams)])) {
      if (filterParams[key]) {
        setParams[key] = filterParams[key];
      } else {
        setParams[key] = undefined;
      }
    }
    router.setParams(navigate, location, { ...setParams });

    return router;
  };

  const isFiltered = (): boolean => {
    for (const param in queryParams) {
      if (FILTER_PARAMS.includes(param)) {
        return true;
      }
    }

    return false;
  };

  const clearFilter = () => {
    router.removeParams(navigate, location, ...Object.keys(queryParams));
  };

  if (posProductsQuery.loading) {
    return <Spinner />;
  }

  const productList = (bulkProps) => {
    const products =
      (posProductsQuery && posProductsQuery?.data?.posProducts.products) || [];
    const totalCount =
      (posProductsQuery && posProductsQuery?.data?.posProducts.totalCount) || 0;

    const searchValue = queryParams.searchValue || "";

    const updatedProps = {
      ...props,
      queryParams,
      products,
      totalCount,
      loading: posProductsQuery.loading,
      searchValue,

      onFilter,
      onSelect,
      onSearch,
      isFiltered: isFiltered(),
      clearFilter,
    };

    return <List {...updatedProps} {...bulkProps} />;
  };

  const refetch = () => {
    posProductsQuery.refetch();
  };

  return <Bulk content={productList} refetch={refetch} />;
};

export const genParams = ({ queryParams }) => ({
  ...generateParams({ queryParams }),
  searchValue: queryParams.searchValue,
  categoryId: queryParams.categoryId,
});

export default ProductList;
