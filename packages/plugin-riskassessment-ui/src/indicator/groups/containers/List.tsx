import * as compose from "lodash.flowright";

import { Alert, EmptyState, Spinner, confirm } from "@erxes/ui/src";
import { generateParams, refetchQueries } from "../common/utilss";
import { mutations, queries } from "../graphql";

import { IIndicatorsGroupsQueryResponse } from "../common/types";
import ListComponent from "../components/List";
import React from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { withProps } from "@erxes/ui/src/utils/core";

type Props = {
  queryParams: any;
};

type FinalProps = {
  listQuery: IIndicatorsGroupsQueryResponse;
  removeGroups: any;
} & Props;

class List extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { listQuery, removeGroups, queryParams } = this.props;

    if (listQuery.loading) {
      return <Spinner />;
    }

    const { riskIndicatorsGroups, riskIndicatorsGroupsTotalCount } = listQuery;

    const remove = (ids) => {
      confirm().then(() => {
        removeGroups({ variables: { ids } })
          .then(() => {
            Alert.success("You successfully remove groups of indicators");
          })
          .catch((err) => {
            Alert.error(err.message);
          });
      });
    };

    const updatedProps = {
      ...this.props,
      list: riskIndicatorsGroups,
      totalCount: riskIndicatorsGroupsTotalCount,
      queryParams,
      remove,
    };

    return <ListComponent {...updatedProps} />;
  }
}

export default withProps(
  compose(
    graphql<Props>(gql(queries.list), {
      name: "listQuery",
      options: ({ queryParams }) => ({
        variables: generateParams(queryParams),
      }),
    }),
    graphql<Props>(gql(mutations.removeGroups), {
      name: "removeGroups",
      options: ({ queryParams }) => ({
        refetchQueries: refetchQueries(queryParams),
      }),
    })
  )(List)
);
