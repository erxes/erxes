import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import Bulk from '@erxes/ui/src/components/Bulk';
import { withProps } from '@erxes/ui/src/utils';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import List from '../components/WorkList';
import { mutations, queries } from '../graphql';
import {
  WorkRemoveMutationResponse,
  WorksQueryResponse,
  WorksTotalCountQueryResponse
} from '../types';
import Alert from '@erxes/ui/src/utils/Alert';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  worksQuery: WorksQueryResponse;
  worksTotalCountQuery: WorksTotalCountQueryResponse;
} & Props &
  WorkRemoveMutationResponse;

class WorkListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      worksQuery,
      worksTotalCountQuery,
      queryParams,
      workRemove
    } = this.props;

    if (worksQuery.loading || worksTotalCountQuery.loading) {
      return false;
    }

    const removeWork = (id: string) => {
      workRemove({
        variables: { _id: id }
      })
        .then(() => {
          Alert.success('You successfully deleted a work');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const works = worksQuery.works || [];
    const worksCount = worksTotalCountQuery.worksTotalCount || 0;
    const searchValue = this.props.queryParams.searchValue || '';

    const updatedProps = {
      ...this.props,
      queryParams,
      works,
      worksCount,
      loading: worksQuery.loading,
      searchValue,
      removeWork
    };

    const workList = props => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.worksQuery.refetch();
      this.props.worksTotalCountQuery.refetch();
    };

    return <Bulk content={workList} refetch={refetch} />;
  }
}

const generateParams = ({ queryParams }) => ({
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
  productId: queryParams.productId,
  jobCategoryId: queryParams.jobCategoryId,
  jobReferId: queryParams.jobReferId
});

export default withProps<Props>(
  compose(
    graphql<Props, WorksQueryResponse, {}>(gql(queries.works), {
      name: 'worksQuery',
      options: ({ queryParams }) => ({
        variables: {
          ...generateParams({ queryParams }),
          ...generatePaginationParams(queryParams)
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, WorksTotalCountQueryResponse, {}>(
      gql(queries.worksTotalCount),
      {
        name: 'worksTotalCountQuery',
        options: ({ queryParams }) => ({
          variables: {
            ...generateParams({ queryParams })
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, WorkRemoveMutationResponse, { workId: string }>(
      gql(mutations.workRemove),
      {
        name: 'workRemove',
        options: {
          refetchQueries: ['works', 'worksTotalCount']
        }
      }
    )
  )(WorkListContainer)
);
