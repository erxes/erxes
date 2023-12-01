import dayjs from 'dayjs';
import Icon from '@erxes/ui/src/components/Icon';
import { __ } from 'coreui/utils';
import _ from 'lodash';
import React from 'react';

import { ExtraRow, DidAmount, WillAmount } from '../../styles';
import { ISchedule } from '../../types';

type Props = {
  schedule: ISchedule;
  leaseType?: string;
};

function ScheduleRow({ schedule, leaseType }: Props) {
  const renderIcon = status => {
    if (status === 'done') {
      return <Icon icon={'medal'} color={'orange'} />;
    }
    if (status === 'skipped') {
      return <Icon icon={'skip-forward-alt'} color={'blue'} />;
    }
    if (status === 'less') {
      return <Icon icon={'thumbs-down'} color={'red'} />;
    }

    return <Icon icon={'sync-exclamation'} color={'green'} />;
  };
  const renderCell = (name, didName) => {
    if (!schedule[didName]) {
      return (schedule[name] || 0).toLocaleString();
    }

    return (
      <>
        <WillAmount>{(schedule[name] || 0).toLocaleString()}</WillAmount>
        <DidAmount> / {(schedule[didName] || 0).toLocaleString()}</DidAmount>
      </>
    );
  };

  return (
    <ExtraRow isDefault={schedule.isDefault} key={schedule._id}>
      <td>{renderIcon(schedule.status)}</td>
      <td>{dayjs(schedule.payDate).format('ll')}</td>
      <td>{(schedule.balance || 0).toLocaleString()}</td>
      <td>{renderCell('payment', 'didPayment')}</td>
      <td>{renderCell('interest', 'didInterest')}</td>
      {leaseType === 'linear' && (
        <td>{renderCell('commitmentInterest', 'didCommitmentInterest')}</td>
      )}
      <td>{renderCell('undue', 'didUndue')}</td>
      <td>{renderCell('total', 'didTotal')}</td>
    </ExtraRow>
  );
}

export default ScheduleRow;
