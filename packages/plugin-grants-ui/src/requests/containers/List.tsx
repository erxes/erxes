import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import List from '../components/List';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import { queries, mutations } from '../graphql';
import { Alert, Spinner, confirm } from '@erxes/ui/src';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};
type FinalProps = {
  listQuery: any;
  removeRequests: any;
} & Props;
class ListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { listQuery, queryParams, history, removeRequests } = this.props;

    if (listQuery.loading) {
      return <Spinner />;
    }

    const { grantRequests, grantRequestsTotalCount } = listQuery;

    const remove = (ids: string[]) => {
      confirm(
        'this action will erase every data of Requests.Are you sure?'
      ).then(() => {
        removeRequests({ variables: { ids } })
          .then(() => {
            Alert.success('Removed successfully');
          })
          .catch(err => {
            Alert.error(err.message);
          });
      });
    };

    const updatedProps = {
      queryParams,
      history,
      list: grantRequests || [],
      totalCount: grantRequestsTotalCount,
      handleRemove: remove
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
    onlyWaitingMe: ['true'].includes(queryParams?.onlyWaitingMe),
    archived: queryParams?.archived === 'true',
    ...generatePaginationParams(queryParams || {})
  };
};

const refetchQueries = queryParams => {
  return [
    {
      query: gql(queries.requests),
      variables: { ...generateQueryParams(queryParams) }
    }
  ];
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
    }),
    graphql<Props>(gql(mutations.removeRequests), {
      name: 'removeRequests',
      options: ({ queryParams }) => ({
        refetchQueries: refetchQueries(queryParams)
      })
    })
  )(ListContainer)
);
