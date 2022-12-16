import * as compose from 'lodash.flowright';
import Detail from '../components/Detail';
import gql from 'graphql-tag';
import React from 'react';
import { Alert, Spinner, withProps } from '@erxes/ui/src';
import { graphql } from 'react-apollo';
import { IRouterProps } from '@erxes/ui/src/types';
import {
  OverallWorkDetailQueryResponse,
  PerformRemoveMutationResponse,
  PerformsQueryResponse
} from '../types';
import { mutations, queries } from '../graphql';
import { withRouter } from 'react-router-dom';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  overallWorkDetailQuery: OverallWorkDetailQueryResponse;
  performsQuery: PerformsQueryResponse;
} & Props &
  IRouterProps &
  PerformRemoveMutationResponse;

class OverallWorkDetailContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const { overallWorkDetailQuery, performsQuery, performRemove } = this.props;

    if (overallWorkDetailQuery.loading || performsQuery.loading) {
      return <Spinner />;
    }

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
      performs,
      removePerform
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
    graphql<{ queryParams }, PerformsQueryResponse, {}>(gql(queries.performs), {
      name: 'performsQuery',
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
  )(withRouter<IRouterProps>(OverallWorkDetailContainer))
);
