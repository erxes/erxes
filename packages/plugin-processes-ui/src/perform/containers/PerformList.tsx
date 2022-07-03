import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from '@erxes/ui/src/components/Bulk';
import { withProps } from '@erxes/ui/src/utils';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../components/perform/PerformList';
import { queries } from '../graphql';
import { WorksQueryResponse, WorksTotalCountQueryResponse } from '../types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  worksQuery: WorksQueryResponse;
  worksTotalCountQuery: WorksTotalCountQueryResponse;
} & Props;

class WorkListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { worksQuery, worksTotalCountQuery, queryParams } = this.props;

    if (worksQuery.loading || worksTotalCountQuery.loading) {
      return false;
    }

    const works = worksQuery.works || [];
    const worksCount = worksTotalCountQuery.worksTotalCount || 0;
    const searchValue = this.props.queryParams.searchValue || '';

    const updatedProps = {
      ...this.props,
      queryParams,
      works,
      worksCount,
      loading: worksQuery.loading,
      searchValue
    };

    const performsList = props => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.worksQuery.refetch();
      this.props.worksTotalCountQuery.refetch();
    };

    return <Bulk content={performsList} refetch={refetch} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, WorksQueryResponse, {}>(gql(queries.works), {
      name: 'worksQuery',
      options: ({ queryParams }) => ({
        variables: {
          searchValue: queryParams.searchValue,
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
            searchValue: queryParams.searchValue
          },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(WorkListContainer)
);
