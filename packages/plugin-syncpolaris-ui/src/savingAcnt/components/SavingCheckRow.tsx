import FormControl from '@erxes/ui/src/components/form/Control';
import React from 'react';
type Props = {
  saving: any;
  toggleBulk: (target: any, toAdd: boolean) => void;
  isChecked?: boolean;
};

function SavingRow({ saving, toggleBulk, isChecked }: Props) {
  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(saving, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  return (
    <tr key={saving._id}>
      <td id="savingsCheckBox" style={{ width: '50px' }} onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{saving.number}</td>
      <td>{saving.status}</td>
      <td>{saving.startDate}</td>
      <td>{saving.endDate}</td>
    </tr>
  );
}

export default SavingRow;
