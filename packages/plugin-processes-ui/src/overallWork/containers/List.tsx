import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import List from '../components/List';
import React from 'react';
import { graphql } from 'react-apollo';
import { IRouterProps } from '@erxes/ui/src/types';
import {
  OverallWorksCountQueryResponse,
  OverallWorksQueryResponse
} from '../types';
import { queries } from '../graphql';
import { withRouter } from 'react-router-dom';
import { withProps, router, Spinner } from '@erxes/ui/src';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  overallWorksQuery: OverallWorksQueryResponse;
  overallWorksCountQuery: OverallWorksCountQueryResponse;
} & Props &
  IRouterProps;

class OverallWorksContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { overallWorksQuery, overallWorksCountQuery } = this.props;

    if (overallWorksCountQuery.loading || overallWorksQuery.loading) {
      return <Spinner />;
    }

    const overallWorks = overallWorksQuery.overallWorks || [];

    const totalCount = overallWorksCountQuery.overallWorksCount || 0;

    const updatedProps = {
      ...this.props,
      overallWorks,
      totalCount
    };

    return <List {...updatedProps} />;
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
    graphql<{ queryParams: any }, OverallWorksQueryResponse, {}>(
      gql(queries.overallWorks),
      {
        name: 'overallWorksQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<{ queryParams: any }, OverallWorksCountQueryResponse, {}>(
      gql(queries.overallWorksCount),
      {
        name: 'overallWorksCountQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    )
  )(withRouter<IRouterProps>(OverallWorksContainer))
);
