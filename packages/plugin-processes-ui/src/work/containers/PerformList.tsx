import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from '@erxes/ui/src/components/Bulk';
import { withProps } from '@erxes/ui/src/utils';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../components/PerformList';
import { queries as performQueries } from '../../overallWork/graphql';
import {
  PerformsQueryResponse,
  PerformsCountQueryResponse
} from '../../overallWork/types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  performsQuery: PerformsQueryResponse;
  performsTotalCountQuery: PerformsCountQueryResponse;
} & Props;

class WorkListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { performsQuery, performsTotalCountQuery, queryParams } = this.props;

    if (performsQuery.loading || performsTotalCountQuery.loading) {
      return false;
    }

    const performs = performsQuery.performs || [];
    const performsCount = performsTotalCountQuery.performsCount || 0;

    const searchValue = this.props.queryParams.searchValue || '';

    const updatedProps = {
      ...this.props,
      queryParams,
      performs,
      performsCount,
      loading: performsQuery.loading,
      searchValue
    };

    const performsList = props => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.performsQuery.refetch();
      this.props.performsTotalCountQuery.refetch();
    };

    return <Bulk content={performsList} refetch={refetch} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, PerformsQueryResponse, {}>(gql(performQueries.performs), {
      name: 'performsQuery',
      options: ({ queryParams }) => ({
        variables: {
          searchValue: queryParams.searchValue,
          ...generatePaginationParams(queryParams)
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, PerformsCountQueryResponse, {}>(
      gql(performQueries.performsCount),
      {
        name: 'performsTotalCountQuery',
        options: ({ queryParams }) => ({
          variables: {
            searchValue: queryParams.searchValue
          },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(WorkListContainer)
);
