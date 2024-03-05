import FormControl from '@erxes/ui/src/components/form/Control';
import React from 'react';
type Props = {
  item: any;
  toggleBulk: (target: any, toAdd: boolean) => void;
  isChecked?: boolean;
  type;
};

function CustomerRow({ item, toggleBulk, isChecked, type }: Props) {
  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(item, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  return (
    <tr key={item._id}>
      <td id="customersCheckBox" style={{ width: '50px' }} onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{type === 'acnt' ? item?.number : item?.code}</td>
      <td>{type === 'acnt' ? item?.status : item?.lastName}</td>
      <td>{type === 'acnt' ? item?.startDate : item?.firstName}</td>
      <td>{type === 'acnt' ? item?.endDate : item?.phones}</td>
    </tr>
  );
}

export default CustomerRow;
