import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from '@erxes/ui/src/components/Bulk';
import { withProps } from '@erxes/ui/src/utils';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../components/perform/PerformList';
import { queries } from '../graphql';
import {
  IOverallWork,
  OverallWorksSideBarDetailQueryResponse,
  PerformsQueryResponse,
  PerformsTotalCountQueryResponse
} from '../types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  performsQuery: PerformsQueryResponse;
  performsTotalCountQuery: PerformsTotalCountQueryResponse;
  overallWorksSideBarDetailQuery: OverallWorksSideBarDetailQueryResponse;
} & Props;

class WorkListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      performsQuery,
      overallWorksSideBarDetailQuery,
      performsTotalCountQuery,
      queryParams
    } = this.props;

    if (
      performsQuery.loading ||
      performsTotalCountQuery.loading ||
      overallWorksSideBarDetailQuery.loading
    ) {
      return false;
    }

    const performs = performsQuery.performs || [];
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
    graphql<Props, PerformsQueryResponse, {}>(gql(queries.performs), {
      name: 'performsQuery',
      options: ({ queryParams }) => ({
        variables: {
          searchValue: queryParams.searchValue,
          ...generatePaginationParams(queryParams)
        },
        fetchPolicy: 'network-only'
      })
    }),
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
