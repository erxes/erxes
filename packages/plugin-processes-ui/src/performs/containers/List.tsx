import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import Bulk from '@erxes/ui/src/components/Bulk';
import { Alert, router, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import {
  PerformsQueryResponse,
  PerformsCountQueryResponse,
  PerformRemoveMutationResponse
} from '../types';
import { IRouterProps } from '@erxes/ui/src/types';

type Props = {
  queryParams: any;
  history: any;
} & IRouterProps;

type FinalProps = {
  performsQuery: PerformsQueryResponse;
  performsTotalCountQuery: PerformsCountQueryResponse;
} & Props &
  PerformRemoveMutationResponse;

class WorkListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      performsQuery,
      performsTotalCountQuery,
      queryParams,
      performRemove
    } = this.props;

    if (performsQuery.loading || performsTotalCountQuery.loading) {
      return false;
    }

    const performs = performsQuery.performs || [];
    const performsCount = performsTotalCountQuery.performsCount || 0;

    const removePerform = (_id: string) => {
      performRemove({
        variables: { _id }
      })
        .then(() => {
          Alert.success('You successfully deleted a performance');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      queryParams,
      performs,
      performsCount,
      removePerform,
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
  status: queryParams.status,
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
    graphql<Props, PerformsQueryResponse, {}>(gql(queries.performs), {
      name: 'performsQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams }),
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, PerformsCountQueryResponse, {}>(gql(queries.performsCount), {
      name: 'performsTotalCountQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams }),
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, PerformRemoveMutationResponse, { performId: string }>(
      gql(mutations.performRemove),
      {
        name: 'performRemove',
        options: {
          refetchQueries: ['performs', 'overallWorkDetail', 'performsCount']
        }
      }
    )
  )(WorkListContainer)
);
