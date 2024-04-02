import * as compose from 'lodash.flowright';

import { Alert, Spinner, withProps } from '@erxes/ui/src';
import {
  PerformRemoveMutationResponse,
  PerformsCountQueryResponse,
  PerformsQueryResponse,
} from '../../performs/types';
import {
  mutations as performMutations,
  queries as performQueries,
} from '../../performs/graphql';

import Detail from '../components/Detail';
import { OverallWorkDetailQueryResponse } from '../types';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../graphql';
import { router } from '@erxes/ui/src/utils';

type Props = {
  queryParams: any;
};

type FinalProps = {
  overallWorkDetailQuery: OverallWorkDetailQueryResponse;
  performsQuery: PerformsQueryResponse;
  performsCountQuery: PerformsCountQueryResponse;
} & Props &
  PerformRemoveMutationResponse;

class OverallWorkDetailContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  render() {
    const {
      overallWorkDetailQuery,
      performsQuery,
      performsCountQuery,
      performRemove,
    } = this.props;

    if (
      overallWorkDetailQuery.loading ||
      performsQuery.loading ||
      performsCountQuery.loading
    ) {
      return <Spinner />;
    }

    const removePerform = (_id: string) => {
      performRemove({
        variables: { _id },
      })
        .then(() => {
          Alert.success('You successfully deleted a performance');
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    };

    let errorMsg: string = '';
    if (overallWorkDetailQuery.error) {
      errorMsg = overallWorkDetailQuery.error.message;
      Alert.error(errorMsg);
    }

    const overallWork = overallWorkDetailQuery.overallWorkDetail;
    const performs = performsQuery.performs || [];
    const performsCount = performsCountQuery.performsCount || 0;

    const updatedProps = {
      ...this.props,
      errorMsg,
      overallWork,
      performs,
      performsCount,
      removePerform,
    };

    return <Detail {...updatedProps} />;
  }
}

const generateParams = ({ queryParams }) => ({
  type: queryParams.type,
  startDate: queryParams.startDate,
  endDate: queryParams.endDate,
  inBranchId: queryParams.inBranchId,
  inDepartmentId: queryParams.inDepartmentId,
  outBranchId: queryParams.outBranchId,
  outDepartmentId: queryParams.outDepartmentId,
  productCategoryId: queryParams.productCategoryId,
  productIds: queryParams.productIds,
  jobReferId: queryParams.jobReferId,
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams }, OverallWorkDetailQueryResponse, {}>(
      gql(queries.overallWorkDetail),
      {
        name: 'overallWorkDetailQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only',
        }),
      },
    ),
    graphql<{ queryParams }, PerformsQueryResponse, {}>(
      gql(performQueries.performs),
      {
        name: 'performsQuery',
        options: ({ queryParams }) => ({
          variables: {
            ...generateParams({ queryParams }),
            ...router.generatePaginationParams(queryParams || {}),
          },
          fetchPolicy: 'network-only',
        }),
      },
    ),
    graphql<{ queryParams }, PerformsCountQueryResponse, {}>(
      gql(performQueries.performsCount),
      {
        name: 'performsCountQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only',
        }),
      },
    ),
    graphql<Props, PerformRemoveMutationResponse, { performId: string }>(
      gql(performMutations.performRemove),
      {
        name: 'performRemove',
        options: {
          refetchQueries: ['performs', 'overallWorkDetail', 'performsCount'],
        },
      },
    ),
  )(OverallWorkDetailContainer),
);
