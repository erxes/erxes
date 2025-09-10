import { gql, useQuery } from "@apollo/client";
import { router } from "@erxes/ui/src/utils";
import React from "react";
import List from "../components/List";
import { queries } from "../graphql";

type Props = {
  queryParams: any;
};

const ListContainer = (props: Props) => {
  const { queryParams } = props;

  const { data, loading } = useQuery(gql(queries.coupons), {
    variables: generateParams(queryParams),
    fetchPolicy: "network-only",
  });

  const { list = [], totalCount = 0 } = data?.coupons || {};

  const finalProps = {
    ...props,
    loading,
    list,
    totalCount,
  };

  return <List {...finalProps} />;
};

export default ListContainer;

const generateParams = (queryParams) => ({
  ...router.generatePaginationParams(queryParams || {}),
  ids: queryParams.ids,
  campaignId: queryParams.campaignId,
  status: queryParams.status,
  ownerId: queryParams.ownerId,
  ownerType: queryParams.ownerType,
  searchValue: queryParams.searchValue,
  sortField: queryParams.orderType,
  sortDirection: Number(queryParams.order) || undefined,
  fromDate: queryParams.fromDate,
  toDate: queryParams.toDate,
});
