import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from '@erxes/ui/src/components/Bulk';
import { router, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../components/PerformList';
import { queries as performQueries } from '../../overallWork/graphql';
import {
  PerformsQueryResponse,
  PerformsCountQueryResponse
} from '../../overallWork/types';
import { IRouterProps } from '@erxes/ui/src/types';

type Props = {
  queryParams: any;
  history: any;
} & IRouterProps;

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

    const updatedProps = {
      ...this.props,
      queryParams,
      performs,
      performsCount,
      loading: performsQuery.loading
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

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  sortField: queryParams.sortField,
  sortDirection: queryParams.sortDirection
    ? parseInt(queryParams.sortDirection, 10)
    : undefined,
  type: queryParams.type,
  startDate: queryParams.startDate,
  endDate: queryParams.endDate,
  inBranchId: queryParams.inBranchId,
  inDepartmentId: queryParams.inDepartmentId,
  outBranchId: queryParams.outBranchId,
  outDepartmentId: queryParams.outDepartmentId,
  productCategoryId: queryParams.productCategoryId,
  productIds: queryParams.productIds,
  vendorIds: queryParams.vendorIds,
  jobCategoryId: queryParams.jobCategoryId,
  jobReferId: queryParams.jobReferId
});

export default withProps<Props>(
  compose(
    graphql<Props, PerformsQueryResponse, {}>(gql(performQueries.performs), {
      name: 'performsQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams }),
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, PerformsCountQueryResponse, {}>(
      gql(performQueries.performsCount),
      {
        name: 'performsTotalCountQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    )
  )(WorkListContainer)
);
