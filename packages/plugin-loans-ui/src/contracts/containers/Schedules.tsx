import { gql } from '@apollo/client';
import Bulk from '@erxes/ui/src/components/Bulk';
import React, { useEffect, useState } from 'react';
import SchedulesList from '../components/schedules/SchedulesList';
import { queries } from '../graphql';
import { SchedulesQueryResponse, ScheduleYearsQueryResponse } from '../types';
import { useQuery } from '@apollo/client';
import subscriptions from '../graphql/subscriptions';

type Props = {
  contractId: string;
  isFirst: boolean;
  leaseType?: string;
};

const SchedulesListContainer = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const { contractId, isFirst } = props;

  const schedulesQuery = useQuery<SchedulesQueryResponse>(
    gql(queries.schedules),
    {
      skip: !contractId,
      variables: {
        contractId,
        isFirst,
        year: new Date().getFullYear(),
      },
      fetchPolicy: 'network-only',
    },
  );

  useEffect(() => {
    return schedulesQuery.subscribeToMore({
      document: gql(subscriptions.loansSchedulesChanged),
      variables: { contractId },
      updateQuery: () => {
        schedulesQuery.refetch();
      }
    });
  });


  const scheduleYearsQuery = useQuery<ScheduleYearsQueryResponse>(
    gql(queries.scheduleYears),
    {
      skip: !contractId,
      variables: {
        contractId,
      },
    },
  );

  if (scheduleYearsQuery.loading) {
    return null;
  }

  const onClickYear = (year: number) => {
    setCurrentYear(year)
    schedulesQuery.refetch({
      year
    });
  };

  const scheduleYears = scheduleYearsQuery?.data?.scheduleYears || [];
  const schedules = schedulesQuery?.data?.schedules || [];

  const updatedProps = {
    ...props,
    schedules,
    scheduleYears,
    currentYear: currentYear,
    onClickYear,
    loading: schedulesQuery.loading || loading,
  };

  const contractsList = (props) => {
    return <SchedulesList {...updatedProps} {...props} />;
  };

  return <Bulk content={contractsList} />;
};

export default SchedulesListContainer;
