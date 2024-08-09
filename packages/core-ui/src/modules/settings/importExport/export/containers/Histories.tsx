import React from "react";
import { gql, useQuery } from "@apollo/client";

import { AppConsumer } from "appContext";
import ExportHistories from "../components/Histories";
import { ExportHistoriesQueryResponse, IExportHistoryItem } from "../../types";
import Spinner from "@erxes/ui/src/components/Spinner";
import { generatePaginationParams } from "modules/common/utils/router";
import { queries } from "../graphql";
import { router } from "modules/common/utils";
import { useLocation, Location } from "react-router-dom";

type Props = {
  queryParams: Record<string, string>;
  location: Location;
  showLoadingBar: (isRemovingImport: boolean) => void;
  closeLoadingBar: () => void;
  isDoneIndicatorAction: boolean;
};

const HistoriesContainer = (props: Props) => {
  const location = useLocation();

  const historiesQuery = useQuery<ExportHistoriesQueryResponse>(
    gql(queries.exportHistories),
    {
      fetchPolicy: "network-only",
      variables: historiesListParams(props.queryParams),
      pollInterval: 3000,
    }
  );

  const histories = historiesQuery.data
    ? historiesQuery.data.exportHistories
    : ({} as IExportHistoryItem);
  const list = histories.list || [];

  if (historiesQuery.loading) {
    return <Spinner />;
  }

  if (list.length === 0) {
    historiesQuery.stopPolling();
  }

  if (list[0] && list[0].percentage === 100) {
    historiesQuery.stopPolling();
  }

  const currentType = router.getParam(location, "type");

  const updatedProps = {
    ...props,
    histories: histories.list || [],
    loading: historiesQuery.loading || false,
    totalCount: histories.count || 0,
    currentType,
  };

  return (
    <>
      <ExportHistories {...updatedProps} />
    </>
  );
};

const historiesListParams = (queryParams) => ({
  ...generatePaginationParams(queryParams),
  type: queryParams.type || "customer",
});

const WithConsumer = (props) => {
  return (
    <AppConsumer>
      {({ showLoadingBar, closeLoadingBar }) => (
        <HistoriesContainer
          {...props}
          showLoadingBar={showLoadingBar}
          closeLoadingBar={closeLoadingBar}
        />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
