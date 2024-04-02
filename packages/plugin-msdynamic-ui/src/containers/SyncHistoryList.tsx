import { gql } from "@apollo/client";
import * as compose from "lodash.flowright";
import { graphql } from "@apollo/client/react/hoc";
import { router, withProps } from "@erxes/ui/src/utils";
import SyncHistoryList from "../components/SyncHistoryList";
import {
  SyncHistoriesCountQueryResponse,
  SyncHistoriesQueryResponse,
} from "../types";
import { queries } from "../graphql";
import Spinner from "@erxes/ui/src/components/Spinner";
import React from "react";

type Props = {
  queryParams: any;
};

type FinalProps = {
  syncMsdHistoriesQuery: SyncHistoriesQueryResponse;
  syncMsdHistoriesCountQuery: SyncHistoriesCountQueryResponse;
} & Props;

const SyncHistoryListContainer = (props: FinalProps) => {
  const { syncMsdHistoriesQuery, syncMsdHistoriesCountQuery } = props;

  if (syncMsdHistoriesQuery.loading) {
    return <Spinner />;
  }

  const syncHistories = syncMsdHistoriesQuery.syncMsdHistories || [];
  const totalCount = syncMsdHistoriesCountQuery.syncMsdHistoriesCount || 0;

  const updatedProps = {
    ...props,
    syncHistories,
    totalCount,
    loading:
      syncMsdHistoriesQuery.loading || syncMsdHistoriesCountQuery.loading,
  };
  return <SyncHistoryList {...updatedProps} />;
};

const generateParams = ({ queryParams }) => {
  const pageInfo = router.generatePaginationParams(queryParams || {});

  return {
    page: pageInfo.page || 1,
    perPage: pageInfo.perPage || 20,
    sortField: queryParams.sortField,
    sortDirection: Number(queryParams.sortDirection) || undefined,
    userId: queryParams.userId,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    contentType: queryParams.contentType,
    contentId: queryParams.contentId,
    searchConsume: queryParams.searchConsume,
    searchSend: queryParams.searchSend,
    searchResponse: queryParams.searchResponse,
    searchError: queryParams.searchError,
  };
};

export default withProps<Props>(
  compose(
    graphql<Props, SyncHistoriesQueryResponse, {}>(
      gql(queries.syncMsdHistories),
      {
        name: "syncMsdHistoriesQuery",
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: "network-only",
        }),
      }
    ),
    graphql<Props, SyncHistoriesCountQueryResponse, {}>(
      gql(queries.syncMsdHistoriesCount),
      {
        name: "syncMsdHistoriesCountQuery",
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: "network-only",
        }),
      }
    )
  )(SyncHistoryListContainer)
);
