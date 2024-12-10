import * as compose from "lodash.flowright";

import { Alert, confirm } from "@erxes/ui/src/utils";
import { EmptyState, Spinner } from "@erxes/ui/src";
import { mutations, queries } from "@erxes/ui/src/team/graphql";

import { BranchesMainQueryResponse } from "@erxes/ui/src/team/types";
import MainListCompoenent from "../../components/branch/MainList";
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
  listQuery: BranchesMainQueryResponse;
} & Props;

class MainList extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { listQuery } = this.props;

    if (listQuery.loading) {
      return <Spinner />;
    }

    if (listQuery.error) {
      return (
        <EmptyState image="/images/actions/5.svg" text="Something went wrong" />
      );
    }

    const deleteBranches = (ids: string[], callback: () => void) => {
      confirm("This will permanently delete are you absolutely sure?", {
        hasDeleteConfirm: true,
      }).then(() => {
        client
          .mutate({
            mutation: gql(mutations.branchesRemove),
            variables: { ids },
            refetchQueries: ["branchesMain"],
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
    return (
      <MainListCompoenent {...this.props} deleteBranches={deleteBranches} />
    );
  }
}
const generateAdditionalQueryParams = ({ parentId, onlyFirstLevel }) => {
  if (parentId && !onlyFirstLevel) {
    return { parentId };
  }
  if (!parentId && onlyFirstLevel) {
    return {onlyFirstLevel:onlyFirstLevel === "true"?true:undefined};
  }

  return {}
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.branchesMain), {
      name: "listQuery",
      options: ({ queryParams }) => ({
        variables: {
          searchValue: queryParams.searchValue,
          withoutUserFilter: true,
          parentId: queryParams.parentId,
          ...generateAdditionalQueryParams(queryParams),
          ...generatePaginationParams(queryParams || {})
        }
      })
    })
  )(MainList)
);
