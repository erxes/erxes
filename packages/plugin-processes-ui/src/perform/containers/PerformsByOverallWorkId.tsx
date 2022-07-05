import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from '@erxes/ui/src/components/Bulk';
import { withProps } from '@erxes/ui/src/utils';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../components/perform/PerformsByOverallWorkId';
import { queries } from '../graphql';
import {
  IOverallWork,
  OverallWorksSideBarDetailQueryResponse,
  PerformsByOverallWorkIdQueryResponse,
  PerformsTotalCountQueryResponse
} from '../types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  performsByOverallWorkIdQuery: PerformsByOverallWorkIdQueryResponse;
  performsTotalCountQuery: PerformsTotalCountQueryResponse;
  overallWorksSideBarDetailQuery: OverallWorksSideBarDetailQueryResponse;
} & Props;

class WorkListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      performsByOverallWorkIdQuery,
      overallWorksSideBarDetailQuery,
      performsTotalCountQuery,
      queryParams
    } = this.props;

    if (
      performsByOverallWorkIdQuery.loading ||
      performsTotalCountQuery.loading ||
      overallWorksSideBarDetailQuery.loading
    ) {
      return false;
    }

    const performs = performsByOverallWorkIdQuery.performsByOverallWorkId || [];
    const performsCount = performsTotalCountQuery.performsTotalCount || 0;
    const overallWorkDetail =
      overallWorksSideBarDetailQuery.overallWorksSideBarDetail ||
      ({} as IOverallWork);
    const searchValue = this.props.queryParams.searchValue || '';

    const updatedProps = {
      ...this.props,
      queryParams,
      performs,
      performsCount,
      overallWorkDetail,
      loading: performsByOverallWorkIdQuery.loading,
      searchValue
    };

    const performsList = props => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.performsByOverallWorkIdQuery.refetch();
      this.props.performsTotalCountQuery.refetch();
    };

    return <Bulk content={performsList} refetch={refetch} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, PerformsByOverallWorkIdQueryResponse, {}>(
      gql(queries.performsByOverallWorkId),
      {
        name: 'performsByOverallWorkIdQuery',
        options: ({ queryParams }) => ({
          variables: {
            overallWorkId: queryParams.overallWorkId,
            ...generatePaginationParams(queryParams)
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, PerformsTotalCountQueryResponse, {}>(
      gql(queries.performsTotalCount),
      {
        name: 'performsTotalCountQuery',
        options: ({ queryParams }) => ({
          variables: {
            searchValue: queryParams.searchValue
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, OverallWorksSideBarDetailQueryResponse, {}>(
      gql(queries.overallWorksSideBarDetail),
      {
        name: 'overallWorksSideBarDetailQuery',
        options: ({ queryParams }) => ({
          variables: {
            id: queryParams.overallWorkId
          },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(WorkListContainer)
);
