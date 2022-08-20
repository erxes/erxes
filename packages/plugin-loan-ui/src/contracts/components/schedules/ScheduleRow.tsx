import dayjs from 'dayjs';
import { __, Icon } from '@erxes/ui/src';
import _ from 'lodash';
import React from 'react';

import { ExtraRow, DidAmount, WillAmount } from '../../styles';
import { ISchedule } from '../../types';

type Props = {
  schedule: ISchedule;
};

function ScheduleRow({ schedule }: Props) {
  const onClick = e => {
    e.stopPropagation();
  };

  // const onTrClick = () => {
  //   history.push(`/erxes-plugin-loan/contract-details/${contract._id}`);
  // };

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
      <td>{renderCell('undue', 'didUndue')}</td>
      <td>{renderCell('insurance', 'didInsurance')}</td>
      <td>{renderCell('debt', 'didDebt')}</td>
      <td>{renderCell('total', 'didTotal')}</td>
    </ExtraRow>
  );
}

export default ScheduleRow;
