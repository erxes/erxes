import { gql, useQuery } from '@apollo/client';
import { Bulk } from '@erxes/ui/src';
import React, { useState } from 'react';
import SchedulesList from '../components/schedules/SchedulesList';
import { queries } from '../graphql';
import { SchedulesQueryResponse } from '../types';

type Props = {
  isFirst: boolean;
};

const SchedulesListContainer = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const { isFirst } = props;

  const schedulesQuery = useQuery<SchedulesQueryResponse>(
    gql(queries.schedules),
    {
      variables: {
        isFirst,
        year: new Date().getFullYear()
      },
      fetchPolicy: 'network-only'
    }
  );

  const transactions = schedulesQuery?.data?.savingsTransactions || [];

  const updatedProps = {
    ...props,
    transactions,
    loading: schedulesQuery.loading || loading
  };

  const contractsList = (props) => {
    return <SchedulesList {...updatedProps} {...props} />;
  };

  return <Bulk content={contractsList} />;
};

export default SchedulesListContainer;
