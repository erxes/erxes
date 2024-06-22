import DayPlans from '../components/DayPlanList';
import { gql, useQuery, useMutation } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { Alert, router } from '@erxes/ui/src/utils';
import { Bulk } from '@erxes/ui/src/components';
import {
  DayPlansConfirmMutationResponse,
  DayPlansCountQueryResponse,
  DayPlansSumQueryResponse,
  DayPlansEditMutationResponse,
  DayPlansQueryResponse,
  DayPlansRemoveMutationResponse,
  IDayPlan,
  IDayPlanConfirmParams,
} from '../types';
import { mutations, queries } from '../graphql';
import { queries as timeFrameQueries } from '../../settings/graphql';
import { TimeframeQueryResponse } from '../../settings/types';

type Props = {
  queryParams: any;
  type?: string;
};

const DayPlanListContainer = (props: Props) => {
  const { queryParams } = props;

  const [date, setDate] = useState(
    queryParams.date ? new Date(queryParams.date) : new Date(),
  );

  const dayPlanQuery = useQuery<DayPlansQueryResponse>(gql(queries.dayPlans), {
    variables: generateParams({ queryParams, date }),
    fetchPolicy: 'network-only',
  });
  const dayPlansCountQuery = useQuery<DayPlansCountQueryResponse>(
    gql(queries.dayPlansCount),
    {
      variables: generateParams({ queryParams, date }),
      fetchPolicy: 'network-only',
    },
  );
  const dayPlansSumQuery = useQuery<DayPlansSumQueryResponse>(
    gql(queries.yearPlansSum),
    {
      variables: generateParams({ queryParams, date }),
      fetchPolicy: 'network-only',
    },
  );

  const timeFrameQuery = useQuery<TimeframeQueryResponse>(
    gql(timeFrameQueries.timeframes),
  );

  const [dayPlanEdit] = useMutation<DayPlansEditMutationResponse>(
    gql(mutations.dayPlanEdit),
    {
      refetchQueries: ['dayPlans', 'dayPlansCount', 'dayPlansSum'],
    },
  );
  const [dayPlansRemove] = useMutation<DayPlansRemoveMutationResponse>(
    gql(mutations.dayPlansRemove),
    {
      refetchQueries: ['dayPlans', 'dayPlansCount', 'dayPlansSum'],
    },
  );
  const [dayPlansConfirm] = useMutation<DayPlansConfirmMutationResponse>(
    gql(mutations.dayPlansConfirm),
    {
      refetchQueries: ['dayPlans', 'dayPlansCount', 'dayPlansSum'],
    },
  );

  // edit row action
  const edit = (doc: IDayPlan) => {
    dayPlanEdit({
      variables: { ...doc },
    })
      .then(() => {
        Alert.success('You successfully updated a day plan');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  // remove action
  const remove = ({ dayPlanIds }, emptyBulk) => {
    dayPlansRemove({
      variables: { _ids: dayPlanIds },
    })
      .then(() => {
        emptyBulk();

        Alert.success('You successfully deleted a day plan');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  // confirm action
  const toConfirm = (doc: IDayPlanConfirmParams, callback?: () => void) => {
    dayPlansConfirm({
      variables: { ...doc },
    })
      .then(() => {
        if (callback) {
          callback();
        }

        Alert.success('You successfully confirmed');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const dayPlanList = (bulkProps) => {
    const timeFrames = timeFrameQuery?.data?.timeframes || [];
    const searchValue = queryParams.searchValue || '';
    const dayPlans = dayPlanQuery?.data?.dayPlans || [];
    const totalCount = dayPlansCountQuery?.data?.dayPlansCount || 0;
    const totalSum = dayPlansSumQuery?.data?.dayPlansSum || {};

    const updatedProps = {
      ...props,
      queryParams,
      dayPlans,
      totalCount,
      totalSum,
      timeFrames,
      edit,
      remove,
      toConfirm,
      searchValue,
    };

    return <DayPlans {...updatedProps} {...bulkProps} />;
  };

  const refetch = () => {
    dayPlanQuery.refetch();
    dayPlansCountQuery.refetch();
  };

  return <Bulk content={dayPlanList} refetch={refetch} />;
};

const generateParams = ({ queryParams, date }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  _ids: queryParams._ids,
  searchValue: queryParams.searchValue,
  date,
  filterStatus: queryParams.filterStatus,
  departmentId: queryParams.departmentId,
  branchId: queryParams.branchId,
  productId: queryParams.productId,
  productCategoryId: queryParams.productCategoryId,
  minValue: queryParams.minValue,
  maxValue: queryParams.maxValue,
  dateType: queryParams.dateType,
  startDate: queryParams.startDate,
  endDate: queryParams.endDate,
});

export default DayPlanListContainer;
