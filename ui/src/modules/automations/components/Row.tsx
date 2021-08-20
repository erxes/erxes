import FormControl from 'modules/common/components/form/Control';
import React from 'react';
import { IAutomation } from '../types';
import dayjs from 'dayjs';
import { Status } from '../styles';

type Props = {
  automation: IAutomation;
  history: any;
  isChecked: boolean;
  toggleBulk: (automation: IAutomation, isChecked?: boolean) => void;
};

function ActionRow({ automation, history, isChecked, toggleBulk }: Props) {
  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(automation, e.target.checked);
    }
  };

  const onClick = e => {
    e.stopPropagation();
  };

  const onTrClick = () => {
    history.push(`/automations/details/${automation._id}`);
  };

  const renderStatus = () => {
    const status = automation.status;
    const isActive = status !== 'draft' ? true : false;

    return <Status isActive={isActive}>{status}</Status>;
  };

  return (
    <tr onClick={onTrClick}>
      <td id="automationsCheckBox" onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      <td> {automation.name} </td>
      <td> {renderStatus()} </td>
      <td>
        {' '}
        {dayjs(automation.updatedAt || new Date()).format('MM/DD/YYYY')}{' '}
      </td>
      <td>
        {' '}
        {dayjs(automation.createdAt || new Date()).format('MM/DD/YYYY')}{' '}
      </td>
    </tr>
  );
}

export default ActionRow;
