import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from '@erxes/ui/src/components/Bulk';
import { withProps } from '@erxes/ui/src/utils';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../components/overallWork/OverallWorkList';
import { queries } from '../graphql';
import {
  OverallWorksQueryResponse,
  OverallWorksTotalCountQueryResponse
} from '../types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  overallWorksQuery: OverallWorksQueryResponse;
  overallWorksTotalCountQuery: OverallWorksTotalCountQueryResponse;
} & Props;

class OverallWorkListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    console.log('overallWorkList on container');
  }

  render() {
    const {
      overallWorksQuery,
      overallWorksTotalCountQuery,
      queryParams
    } = this.props;

    if (overallWorksQuery.loading || overallWorksTotalCountQuery.loading) {
      return false;
    }

    const overallWorks = overallWorksQuery.overallWorks || [];
    const overallWorksCount =
      overallWorksTotalCountQuery.overallWorksTotalCount || 0;
    const searchValue = this.props.queryParams.searchValue || '';

    const updatedProps = {
      ...this.props,
      queryParams,
      overallWorks,
      overallWorksCount,
      loading: overallWorksQuery.loading,
      searchValue
    };

    const overallWorkList = props => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.overallWorksQuery.refetch(),
        this.props.overallWorksTotalCountQuery.refetch();
    };

    return <Bulk content={overallWorkList} refetch={refetch} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, OverallWorksQueryResponse, {}>(gql(queries.overallWorks), {
      name: 'overallWorksQuery',
      options: ({ queryParams }) => ({
        variables: {
          searchValue: queryParams.searchValue,
          ...generatePaginationParams(queryParams)
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, OverallWorksTotalCountQueryResponse, {}>(
      gql(queries.overallWorksTotalCount),
      {
        name: 'overallWorksTotalCountQuery',
        options: ({ queryParams }) => ({
          variables: {
            searchValue: queryParams.searchValue
          },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(OverallWorkListContainer)
);
