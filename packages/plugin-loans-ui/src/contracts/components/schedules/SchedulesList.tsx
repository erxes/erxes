import { ISchedule, IScheduleYear } from '../../types';

import { __ } from 'coreui/utils';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import ScheduleRow from './ScheduleRow';
import { ScheduleYears } from '../../styles';
import Spinner from '@erxes/ui/src/components/Spinner';
import Table from '@erxes/ui/src/components/table';

interface IProps {
  contractId: string;
  schedules: ISchedule[];
  loading: boolean;
  scheduleYears: IScheduleYear[];
  currentYear: number;
  leaseType?: string;
  onClickYear: (year: number) => void;
}

const SchedulesList = (props: IProps) => {
  const { schedules, loading, leaseType, scheduleYears, onClickYear } = props;

  const renderYear = () => {
    return scheduleYears.map((item) => {
      return (
        <Button key={item.year} onClick={() => onClickYear(item.year)}>
          {item.year}
        </Button>
      );
    });
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <ScheduleYears>{renderYear()}</ScheduleYears>
      <Table $striped>
        <thead>
          <tr>
            <th />
            <th>{__('Date')}</th>
            <th>{__('Loan Balance')}</th>
            <th>{__('Loan Payment')}</th>
            <th>{__('Interest')}</th>
            {leaseType === 'linear' && <th>{__('Commitment interest')}</th>}
            <th>{__('Loss')}</th>
            <th>{__('Total')}</th>
          </tr>
        </thead>
        <tbody id="schedules">
          {schedules.map((schedule) => (
            <ScheduleRow
              schedule={schedule}
              key={schedule._id}
              leaseType={leaseType}
            ></ScheduleRow>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default SchedulesList;
