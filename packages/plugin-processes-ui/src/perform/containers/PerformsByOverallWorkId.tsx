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
  PerformsByOverallWorkIdTotalCountQueryResponse
} from '../types';
import { JobRefersAllQueryResponse } from '../../job/types';
import { queries as jobQueries } from '../../job/graphql';
import { FlowsAllQueryResponse } from '../../flow/types';
import { queries as flowQueries } from '../../flow/graphql';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  performsByOverallWorkIdQuery: PerformsByOverallWorkIdQueryResponse;
  performsByOverallWorkIdTotalCountQuery: PerformsByOverallWorkIdTotalCountQueryResponse;
  overallWorksSideBarDetailQuery: OverallWorksSideBarDetailQueryResponse;
  jobRefersAllQuery: JobRefersAllQueryResponse;
  flowsAllQuery: FlowsAllQueryResponse;
} & Props;

class WorkListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      performsByOverallWorkIdQuery,
      overallWorksSideBarDetailQuery,
      performsByOverallWorkIdTotalCountQuery,
      jobRefersAllQuery,
      flowsAllQuery,
      queryParams
    } = this.props;

    if (
      performsByOverallWorkIdQuery.loading ||
      performsByOverallWorkIdTotalCountQuery.loading ||
      overallWorksSideBarDetailQuery.loading ||
      jobRefersAllQuery.loading ||
      flowsAllQuery.loading
    ) {
      return false;
    }

    const performs = performsByOverallWorkIdQuery.performsByOverallWorkId || [];
    const performsCount =
      performsByOverallWorkIdTotalCountQuery.performsByOverallWorkIdTotalCount ||
      0;
    const overallWorkDetail =
      overallWorksSideBarDetailQuery.overallWorksSideBarDetail ||
      ({} as IOverallWork);
    const searchValue = this.props.queryParams.searchValue || '';
    const jobs = jobRefersAllQuery.jobRefersAll || [];
    const flows = flowsAllQuery.flowsAll || [];

    const updatedProps = {
      ...this.props,
      queryParams,
      performs,
      performsCount,
      overallWorkDetail,
      loading: performsByOverallWorkIdQuery.loading,
      searchValue,
      jobRefers: jobs,
      flows
    };

    const performsList = props => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.performsByOverallWorkIdQuery.refetch();
      this.props.performsByOverallWorkIdTotalCountQuery.refetch();
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
    graphql<Props, PerformsByOverallWorkIdQueryResponse, {}>(
      gql(queries.performsByOverallWorkIdTotalCount),
      {
        name: 'performsByOverallWorkIdTotalCountQuery',
        options: ({ queryParams }) => ({
          variables: {
            overallWorkId: queryParams.overallWorkId
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
    ),
    graphql<Props, JobRefersAllQueryResponse, {}>(
      gql(jobQueries.jobRefersAll),
      {
        name: 'jobRefersAllQuery'
      }
    ),
    graphql<Props, FlowsAllQueryResponse, {}>(gql(flowQueries.flowsAll), {
      name: 'flowsAllQuery'
    })
  )(WorkListContainer)
);
