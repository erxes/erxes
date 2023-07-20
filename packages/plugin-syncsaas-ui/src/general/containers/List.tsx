import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, EmptyState, Spinner, confirm } from '@erxes/ui/src';
import { router, withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import List from '../components/List';
import { mutations, queries } from '../graphql';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  listQuery: any;
  totalCountQuery: any;
  removeSyncMutation: any;
} & Props;

class ListContainer extends React.Component<FinalProps> {
  constructor(props: FinalProps) {
    super(props);
  }

  render() {
    const {
      queryParams,
      history,
      listQuery,
      totalCountQuery,
      removeSyncMutation
    } = this.props;

    const remove = _id => {
      confirm().then(() => {
        removeSyncMutation({ variables: { _id } })
          .then(() => {
            Alert.success('Removed successfully');
          })
          .catch(err => {
            Alert.error(err.message);
          });
      });
    };

    if (listQuery?.loading) {
      return <Spinner />;
    }

    const updatedProps = {
      queryParams,
      history,
      list: listQuery?.syncedSaasList || [],
      totalCount: totalCountQuery?.syncedSaasListTotalCount || 0,
      remove
    };

    return <List {...updatedProps} />;
  }
}

const generateDateFilters = queryParams => {
  const dateFilters: any[] = [];

  let startDate;
  let expireDate;

  if (queryParams?.startDateFrom) {
    startDate = { from: queryParams.startDateFrom };
  }
  if (queryParams?.startDateTo) {
    startDate = { ...startDate, to: queryParams.startDateTo };
  }
  if (queryParams?.expireDateFrom) {
    expireDate = { from: queryParams.expireDateFrom };
  }
  if (queryParams?.expireDateTo) {
    expireDate = { ...expireDate, to: queryParams.expireDateTo };
  }

  if (startDate) {
    dateFilters.push({ ...startDate, name: 'startDate' });
  }
  if (expireDate) {
    dateFilters.push({ ...startDate, name: 'expireDate' });
  }
};

const generateParams = queryParams => {
  return {
    ...router.generatePaginationParams(queryParams || {}),
    searchValue: queryParams?.searchValue,
    dateFilters: generateDateFilters(queryParams)
  };
};

export const refetchQueries = ({ queryParams }) => {
  return [
    {
      query: gql(queries.list),
      variables: { ...generateParams(queryParams) }
    },
    {
      query: gql(queries.totalCount),
      variables: { ...generateParams(queryParams) }
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.list), {
      name: 'listQuery',
      options: ({ queryParams }) => ({
        variables: generateParams(queryParams)
      })
    }),
    graphql<Props>(gql(queries.totalCount), {
      name: 'totalCountQuery',
      options: ({ queryParams }) => ({
        variables: generateParams(queryParams)
      })
    }),
    graphql<Props>(gql(mutations.remove), {
      name: 'removeSyncMutation',
      options: ({ queryParams }) => ({
        refetchQueries: refetchQueries({ queryParams })
      })
    })
  )(ListContainer)
);
