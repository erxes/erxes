import { gql, useQuery } from "@apollo/client";
import { router } from "@erxes/ui/src/utils";
import List from "../components/List";
import { BurenScoringQueryResponse } from "../types";
import { queries } from "../graphql";
import React from "react";

type Props = {
  queryParams: any;
};

const generateParams = ({ queryParams }) => {
  const pageInfo = router.generatePaginationParams(queryParams || {});

  return {
    page: pageInfo.page,
    perPage: pageInfo.perPage    
  };
};

export default function ListContainer(props: Props) {
  const { queryParams } = props;

  const customerScoreList = useQuery<BurenScoringQueryResponse>(
    gql(queries.burenCustomerScoringsMain),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: "network-only",
    }
  );

  const updatedProps = {
    ...props,
    burenCustomerScorings:
      customerScoreList.data?.burenCustomerScoringsMain?.list || [],
    totalCount:
      customerScoreList.data?.burenCustomerScoringsMain?.totalCount || 0,
    refetch: customerScoreList.refetch(),
    loading: customerScoreList.loading,
  };
  return <List {...updatedProps} />;
}
