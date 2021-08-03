import FormControl from 'modules/common/components/form/Control';
import React from 'react';
import { IAutomation } from '../types';

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
      <td> {automation.status} </td>
    </tr>
  );
}

export default ActionRow;
