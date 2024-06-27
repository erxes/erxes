import { Alert, confirm, EmptyState, Spinner } from "@erxes/ui/src";
import { withProps } from "@erxes/ui/src/utils/core";
import { gql } from "@apollo/client";
import * as compose from "lodash.flowright";
import React from "react";
import { graphql } from "@apollo/client/react/hoc";
import {
  OperationsQueryResponse,
  OperationsTotalCountQueryResponse,
  RemoveOperationsMutationResponse,
} from "../common/types";
import { generateParams, refetchQueries } from "../common/utils";
import ListComponent from "../components/List";
import { mutations, queries } from "../graphql";
type Props = {
  queryParams: any;
};

type FinalProps = {
  listQuery: OperationsQueryResponse;
  totalCountQuery: OperationsTotalCountQueryResponse;
  removeOperations: (params: { variables: { ids: string[] } }) => any;
} & Props;

class List extends React.Component<FinalProps> {
  render() {
    const { listQuery, totalCountQuery } = this.props;

    if (listQuery.loading) {
      return <Spinner />;
    }

    if (listQuery.error) {
      return <EmptyState icon="info-circle" text={listQuery.error} />;
    }

    const remove = (ids: string[]) => {
      const { removeOperations } = this.props;
      confirm().then(() => {
        removeOperations({ variables: { ids } }).then(() => {
          Alert.success("Removed successfully");
        });
      });
    };

    const updateProps = {
      ...this.props,
      list: listQuery.operations,
      totalCount: totalCountQuery.operationsTotalCount,
      loading: listQuery.loading,
      remove,
    };

    return <ListComponent {...updateProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.operations), {
      name: "listQuery",
      options: ({ queryParams }) => ({
        variables: generateParams(queryParams),
      }),
    }),
    graphql<Props>(gql(queries.operationsTotalCount), {
      name: "totalCountQuery",
      options: ({ queryParams }) => ({
        variables: generateParams(queryParams),
      }),
    }),
    graphql<Props, RemoveOperationsMutationResponse>(
      gql(mutations.removeOperations),
      {
        name: "removeOperations",
        options: ({ queryParams }) => ({
          refetchQueries: refetchQueries(queryParams),
        }),
      }
    )
  )(List)
);
