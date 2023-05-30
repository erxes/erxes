import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import List from '../components/List';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import queries from '../graphql/queries';
import { Spinner } from '@erxes/ui/src';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};
type FinalProps = {
  listQuery: any;
} & Props;
class ListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { listQuery, queryParams, history } = this.props;

    if (listQuery.loading) {
      return <Spinner />;
    }

    const { grantRequests, grantRequestsTotalCount } = listQuery;

    const updatedProps = {
      queryParams,
      history,
      list: grantRequests || [],
      totalCount: grantRequestsTotalCount
    };

    return <List {...updatedProps} />;
  }
}

const generateQueryParams = queryParams => {
  return {
    status: queryParams.type,
    requesterId: queryParams.requesterId,
    userId: queryParams.recipientId,
    sortField: queryParams?.sortField,
    sortDirection: Number(queryParams?.sortDirection) || undefined,
    createdAtFrom: queryParams.createdAtFrom || undefined,
    createdAtTo: queryParams.createdAtTo || undefined,
    closedAtFrom: queryParams.closedAtFrom || undefined,
    closedAtTo: queryParams.closedAtTo || undefined,
    ...generatePaginationParams(queryParams || {})
  };
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.requests), {
      name: 'listQuery',
      options: ({ queryParams }) => ({
        variables: {
          ...generateQueryParams(queryParams)
        }
      })
    })
  )(ListContainer)
);
