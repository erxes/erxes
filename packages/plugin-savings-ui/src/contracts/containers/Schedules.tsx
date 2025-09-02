import { Bulk } from '@erxes/ui/src';
import React from 'react';
import SchedulesList from '../components/schedules/SchedulesList';
import { ITransaction } from '../../transactions/types';

type Props = {
  contractId: string;
  transactions: ITransaction[];
};

const SchedulesListContainer = (props: Props) => {
  const { transactions } = props;

  const updatedProps = {
    ...props,
    transactions
  };

  const contractsList = (props) => {
    return <SchedulesList {...updatedProps} {...props} />;
  };

  return <Bulk content={contractsList} />;
};

export default SchedulesListContainer;
