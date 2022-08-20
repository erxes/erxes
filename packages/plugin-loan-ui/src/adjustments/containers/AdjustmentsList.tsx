import { Alert, Bulk, router, withProps } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';

import AdjustmentsList from '../components/AdjustmentsList';
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
  adjustmentsMainQuery: MainQueryResponse;
} & Props &
  IRouterProps &
  RemoveMutationResponse;

type State = {
  loading: boolean;
};

class AdjustmentListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const { adjustmentsMainQuery, adjustmentsRemove } = this.props;

    const removeAdjustments = ({ adjustmentIds }, emptyBulk) => {
      adjustmentsRemove({
        variables: { adjustmentIds }
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a adjustment');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } =
      adjustmentsMainQuery.adjustmentsMain || {};

    const updatedProps = {
      ...this.props,
      totalCount,
      searchValue,
      adjustments: list,
      loading: adjustmentsMainQuery.loading || this.state.loading,
      removeAdjustments
    };

    const adjustmentsList = props => {
      return <AdjustmentsList {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.adjustmentsMainQuery.refetch();
    };

    return <Bulk content={adjustmentsList} refetch={refetch} />;
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
  refetchQueries: ['adjustmentsMain']
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, MainQueryResponse, ListQueryVariables>(
      gql(queries.adjustmentsMain),
      {
        name: 'adjustmentsMainQuery',
        options: { ...generateParams }
      }
    ),
    // mutations
    graphql<{}, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.adjustmentsRemove),
      {
        name: 'adjustmentsRemove',
        options: generateOptions
      }
    )
  )(withRouter<IRouterProps>(AdjustmentListContainer))
);
