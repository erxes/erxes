import * as compose from "lodash.flowright";

import { Alert, confirm } from "@erxes/ui/src/utils";
import { EmptyState, Spinner } from "@erxes/ui/src";
import { mutations, queries } from "@erxes/ui/src/team/graphql";

import MainListComponent from "../../components/position/MainList";
import { PositionsMainQueryResponse } from "@erxes/ui/src/team/types";
import React from "react";
import client from "@erxes/ui/src/apolloClient";
import { generatePaginationParams } from "@erxes/ui/src/utils/router";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { withProps } from "@erxes/ui/src/utils/core";

type Props = {
  queryParams: Record<string, string>;
};

type FinalProps = {
  listQuery: PositionsMainQueryResponse;
} & Props;

const MainList = (props: FinalProps) => {
  const { listQuery } = props;
  if (listQuery.loading) {
    return <Spinner />;
  }

  if (listQuery.error) {
    return (
      <EmptyState image="/images/actions/5.svg" text="Something went wrong" />
    );
  }

  const deletePositions = (ids: string[], callback: () => void) => {
    confirm("This will permanently delete are you absolutely sure?", {
      hasDeleteConfirm: true,
    }).then(() => {
      client
        .mutate({
          mutation: gql(mutations.positionsRemove),
          variables: { ids },
          refetchQueries: ["positionsMain"],
        })
        .then(() => {
          callback();
          Alert.success("Successfully deleted");
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  return <MainListComponent {...props} deletePositions={deletePositions} />;
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.positionsMain), {
      name: "listQuery",
      options: ({ queryParams }) => ({
        variables: {
          searchValue: queryParams.searchValue,
          ...generatePaginationParams(queryParams || {}),
        },
      }),
    })
  )(MainList)
);
