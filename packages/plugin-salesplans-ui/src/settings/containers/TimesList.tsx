import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import TimeProportions from '../components/TimesList';
import { Alert, router, withProps } from '@erxes/ui/src/utils';
import { Bulk } from '@erxes/ui/src/components';
import { graphql } from '@apollo/client/react/hoc';
import { mutations, queries } from '../graphql';
import {
  TimeProportionsQueryResponse,
  TimeProportionsRemoveMutationResponse,
  TimeProportionsCountQueryResponse
} from '../types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  timeProportionQuery: TimeProportionsQueryResponse;
  timeProportionCountQuery: TimeProportionsCountQueryResponse;
} & Props &
  TimeProportionsRemoveMutationResponse;

class TimeProportionsContainer extends React.Component<FinalProps> {
  render() {
    const {
      timeProportionQuery,
      timeProportionCountQuery,
      queryParams,
      timeProportionsRemove
    } = this.props;

    if (timeProportionQuery.loading || timeProportionCountQuery.loading) {
      return <Spinner />;
    }

    // remove action
    const remove = ({ timeProportionIds }, emptyBulk) => {
      timeProportionsRemove({
        variables: { _ids: timeProportionIds }
      })
        .then(() => {
          emptyBulk();

          Alert.success('You successfully deleted a time proportions');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const timeProportions = timeProportionQuery.timeProportions || [];
    const totalCount = timeProportionCountQuery.timeProportionsCount || 0;

    const updatedProps = {
      ...this.props,
      queryParams,
      timeProportions,
      totalCount,
      remove
    };

    const timeList = props => <TimeProportions {...updatedProps} {...props} />;

    const refetch = () => {
      this.props.timeProportionQuery.refetch();
    };

    return <Bulk content={timeList} refetch={refetch} />;
  }
}

const getRefetchQueries = () => {
  return ['timeProportions'];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  departmentId: queryParams.departmentId,
  branchId: queryParams.branchId,
  productCategoryId: queryParams.productCategoryId,
  sortField: queryParams.sortField,
  sortDirection: Number(queryParams.sortDirection) || undefined
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, TimeProportionsQueryResponse>(
      gql(queries.timeProportions),
      {
        name: 'timeProportionQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<{ queryParams: any }, TimeProportionsCountQueryResponse>(
      gql(queries.timeProportionsCount),
      {
        name: 'timeProportionCountQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<
      Props,
      TimeProportionsRemoveMutationResponse,
      { timeProportionIds: string[] }
    >(gql(mutations.timeProportionsRemove), {
      name: 'timeProportionsRemove',
      options
    })
  )(TimeProportionsContainer)
);
