import * as compose from 'lodash.flowright';
import DayPlans from '../components/DayPlanList';
import { gql } from '@apollo/client';
import React from 'react';
import { Alert, router, withProps } from '@erxes/ui/src/utils';
import { Bulk } from '@erxes/ui/src/components';
import {
  DayPlansConfirmMutationResponse,
  DayPlansCountQueryResponse,
  DayPlansSumQueryResponse,
  DayPlansEditMutationResponse,
  DayPlansQueryResponse,
  DayPlansRemoveMutationResponse,
  IDayPlan,
  IDayPlanConfirmParams
} from '../types';
import { graphql } from '@apollo/client/react/hoc';
import { mutations, queries } from '../graphql';
import { queries as timeFrameQueries } from '../../settings/graphql';
import { TimeframeQueryResponse } from '../../settings/types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  dayPlanQuery: DayPlansQueryResponse;
  dayPlansCountQuery: DayPlansCountQueryResponse;
  dayPlansSumQuery: DayPlansSumQueryResponse;
  timeFrameQuery: TimeframeQueryResponse;
} & Props &
  DayPlansEditMutationResponse &
  DayPlansRemoveMutationResponse &
  DayPlansConfirmMutationResponse;

class DayPlansContainer extends React.Component<FinalProps> {
  render() {
    const {
      dayPlanQuery,
      dayPlansCountQuery,
      dayPlansSumQuery,
      queryParams,
      timeFrameQuery,
      dayPlanEdit,
      dayPlansRemove,
      dayPlansConfirm
    } = this.props;

    // edit row action
    const edit = (doc: IDayPlan) => {
      dayPlanEdit({
        variables: { ...doc }
      })
        .then(() => {
          Alert.success('You successfully updated a census');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    // remove action
    const remove = ({ dayPlanIds }, emptyBulk) => {
      dayPlansRemove({
        variables: { _ids: dayPlanIds }
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a year plan');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    // confirm action
    const toConfirm = (doc: IDayPlanConfirmParams, callback?: () => void) => {
      dayPlansConfirm({
        variables: { ...doc }
      })
        .then(() => {
          if (callback) {
            callback();
          }

          Alert.success('You successfully confirmed');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const timeFrames = timeFrameQuery.timeframes || [];
    const searchValue = this.props.queryParams.searchValue || '';
    const dayPlans = dayPlanQuery.dayPlans || [];
    const totalCount = dayPlansCountQuery.dayPlansCount || 0;
    const totalSum = dayPlansSumQuery.dayPlansSum || {};

    const updatedProps = {
      ...this.props,
      queryParams,
      dayPlans,
      totalCount,
      totalSum,
      timeFrames,
      edit,
      remove,
      toConfirm,
      searchValue
    };

    const dayPlanList = props => <DayPlans {...updatedProps} {...props} />;

    const refetch = () => {
      this.props.dayPlanQuery.refetch();
    };

    return <Bulk content={dayPlanList} refetch={refetch} />;
  }
}

const getRefetchQueries = () => {
  return ['dayPlans', 'dayPlansCount', 'dayPlansSum'];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  _ids: queryParams._ids,
  searchValue: queryParams.searchValue,
  date: new Date(queryParams.date),
  filterStatus: queryParams.filterStatus,
  departmentId: queryParams.departmentId,
  branchId: queryParams.branchId,
  productId: queryParams.productId,
  productCategoryId: queryParams.productCategoryId,
  minValue: queryParams.minValue,
  maxValue: queryParams.maxValue,
  dateType: queryParams.dateType,
  startDate: queryParams.startDate,
  endDate: queryParams.endDate
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, DayPlansQueryResponse>(
      gql(queries.dayPlans),
      {
        name: 'dayPlanQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<{ queryParams: any }, DayPlansCountQueryResponse>(
      gql(queries.dayPlansCount),
      {
        name: 'dayPlansCountQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<{ queryParams: any }, DayPlansSumQueryResponse>(
      gql(queries.dayPlansSum),
      {
        name: 'dayPlansSumQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<{}, TimeframeQueryResponse>(gql(timeFrameQueries.timeframes), {
      name: 'timeFrameQuery'
    }),
    graphql<Props, DayPlansEditMutationResponse, {}>(
      gql(mutations.dayPlanEdit),
      {
        name: 'dayPlanEdit',
        options
      }
    ),
    graphql<Props, DayPlansRemoveMutationResponse, { dayPlanIds: string[] }>(
      gql(mutations.dayPlansRemove),
      {
        name: 'dayPlansRemove',
        options
      }
    ),
    graphql<Props, DayPlansConfirmMutationResponse, {}>(
      gql(mutations.dayPlansConfirm),
      {
        name: 'dayPlansConfirm',
        options
      }
    )
  )(DayPlansContainer)
);
