import * as compose from 'lodash.flowright';
import Detail from '../components/Detail';
import gql from 'graphql-tag';
import React from 'react';
import { Alert, Spinner, withProps } from '@erxes/ui/src';
import { graphql } from 'react-apollo';
import { IRouterProps } from '@erxes/ui/src/types';
import {
  OverallWorkDetailQueryResponse,
  PerformsQueryResponse
} from '../types';
import { queries } from '../graphql';
import { queries as performQueries } from '../../perform/graphql';
import { withRouter } from 'react-router-dom';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  overallWorkDetailQuery: OverallWorkDetailQueryResponse;
  performsQuery: PerformsQueryResponse;
} & Props &
  IRouterProps;

class OverallWorkDetailContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const { overallWorkDetailQuery, performsQuery } = this.props;

    if (overallWorkDetailQuery.loading || performsQuery.loading) {
      return <Spinner />;
    }

    let errorMsg: string = '';
    if (overallWorkDetailQuery.error) {
      errorMsg = overallWorkDetailQuery.error.message;
      Alert.error(errorMsg);
    }

    const overallWork = overallWorkDetailQuery.overallWorkDetail;
    const performs = performsQuery.performs;

    const updatedProps = {
      ...this.props,
      errorMsg,
      overallWork,
      performs
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
  productId: queryParams.productId,
  jobReferId: queryParams.jobReferId
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams }, OverallWorkDetailQueryResponse, {}>(
      gql(queries.overallWorkDetail),
      {
        name: 'overallWorkDetailQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<{ queryParams }, PerformsQueryResponse, {}>(
      gql(performQueries.performs),
      {
        name: 'performsQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    )
  )(withRouter<IRouterProps>(OverallWorkDetailContainer))
);
