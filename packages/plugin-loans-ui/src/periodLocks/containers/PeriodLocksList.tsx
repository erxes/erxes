import { Alert, Bulk, router, withProps } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';

import PeriodLocksList from '../components/PeriodLocksList';
import { mutations, queries } from '../graphql';
import {
  ListQueryVariables,
  MainQueryResponse,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  periodLocksMainQuery: MainQueryResponse;
} & Props &
  IRouterProps &
  RemoveMutationResponse;

type State = {
  loading: boolean;
};

class PeriodLockListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const { periodLocksMainQuery, periodLocksRemove } = this.props;

    const removePeriodLocks = ({ periodLockIds }, emptyBulk) => {
      periodLocksRemove({
        variables: { periodLockIds }
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a periodLock');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } =
      periodLocksMainQuery.periodLocksMain || {};

    const updatedProps = {
      ...this.props,
      totalCount,
      searchValue,
      periodLocks: list,
      loading: periodLocksMainQuery.loading || this.state.loading,
      removePeriodLocks
    };

    const periodLocksList = props => {
      return <PeriodLocksList {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.periodLocksMainQuery.refetch();
    };

    return <Bulk content={periodLocksList} refetch={refetch} />;
  }
}

const generateParams = ({ queryParams }) => ({
  variables: {
    ...router.generatePaginationParams(queryParams || {}),
    ids: queryParams.ids,
    searchValue: queryParams.searchValue,
    sortField: queryParams.sortField,
    sortDirection: queryParams.sortDirection
      ? parseInt(queryParams.sortDirection, 10)
      : undefined
  },
  fetchPolicy: 'network-only'
});

const generateOptions = () => ({
  refetchQueries: ['periodLocksMain']
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, MainQueryResponse, ListQueryVariables>(
      gql(queries.periodLocksMain),
      {
        name: 'periodLocksMainQuery',
        options: { ...generateParams }
      }
    ),
    // mutations
    graphql<{}, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.periodLocksRemove),
      {
        name: 'periodLocksRemove',
        options: generateOptions
      }
    )
  )(withRouter<IRouterProps>(PeriodLockListContainer))
);
