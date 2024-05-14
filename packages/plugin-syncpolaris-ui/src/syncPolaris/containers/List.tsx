import * as compose from "lodash.flowright";
import {
  SyncHistoriesQueryResponse,
  SyncHistoriesCountQueryResponse,
  ToCheckMutationResponse,
  ToSyncMutationResponse,
} from "../../types";
import { queries } from "../../graphql";
import { router, withProps } from "@erxes/ui/src/utils/core";
import List from "../components/List";
import React from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import mutations from "../../graphql/mutations";
import Alert from "@erxes/ui/src/utils/Alert";

type Props = {
  queryParams: any;
  contentType: string;
};
type State = {
  items: any;
  loading: boolean;
};
type FinalProps = {
  syncHistoriesQuery: SyncHistoriesQueryResponse;
  syncHistoriesCountQuery: SyncHistoriesCountQueryResponse;
} & Props &
  ToCheckMutationResponse &
  ToSyncMutationResponse;

class CustomerContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      loading: false,
    };
  }
  render() {
    const {
      queryParams,
      syncHistoriesQuery,
      syncHistoriesCountQuery,
      contentType,
    } = this.props;
    const { items } = this.state;

    const toCheckPolaris = (type: string) => {
      this.setState({ loading: true });
      this.props
        .toCheckPolaris({ variables: { type } })
        .then((response) => {
          this.setState({
            items: response.data.toCheckPolaris.results.items || [],
          });
          this.setState({ loading: false });
        })
        .catch((e) => {
          Alert.error(e.message);
          this.setState({ loading: false });
        });
    };

    const toSyncPolaris = (type: string, items: any[]) => {
      this.setState({ loading: true });
      this.props
        .toSyncPolaris({
          variables: {
            type,
            items,
          },
        })
        .then(() => {
          this.setState({ loading: false });
          Alert.success("Success. Please check again.");
        })
        .catch((e) => {
          Alert.error(e.message);
          this.setState({ loading: false });
        });
    };

    const syncHistoriesPolaris = syncHistoriesQuery.syncHistoriesPolaris || [];
    const totalCount = syncHistoriesCountQuery.syncHistoriesCountPolaris || 0;
    const updatedProps = {
      ...this.props,
      queryParams,
      toCheckPolaris,
      toSyncPolaris,
      syncHistoriesPolaris,
      totalCount,
      items,
      contentType,
      loading: syncHistoriesQuery.loading || syncHistoriesCountQuery.loading,
    };
    return <List {...updatedProps} />;
  }
}

const generateParams = ({ queryParams }, { contentType }) => {
  const pageInfo = router.generatePaginationParams(queryParams || {});
  return {
    page: pageInfo.page || 1,
    perPage: pageInfo.perPage || 20,
    sortField: queryParams.sortField,
    sortDirection: Number(queryParams.sortDirection) || undefined,
    userId: queryParams.userId,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    contentType: contentType,
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
      gql(queries.syncHistoriesPolaris),
      {
        name: "syncHistoriesQuery",
        options: ({ queryParams, contentType }) => ({
          variables: generateParams({ queryParams }, { contentType }),
          fetchPolicy: "network-only",
        }),
      }
    ),
    graphql<Props, SyncHistoriesCountQueryResponse, {}>(
      gql(queries.syncHistoriesCountPolaris),
      {
        name: "syncHistoriesCountQuery",
        options: ({ queryParams, contentType }) => ({
          variables: generateParams({ queryParams }, { contentType }),
          fetchPolicy: "network-only",
        }),
      }
    ),
    graphql<Props, ToCheckMutationResponse, {}>(gql(mutations.toCheckPolaris), {
      name: "toCheckPolaris",
    }),
    graphql<Props, ToSyncMutationResponse, {}>(gql(mutations.toSyncPolaris), {
      name: "toSyncPolaris",
    })
  )(CustomerContainer)
);
