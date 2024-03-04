import FormControl from '@erxes/ui/src/components/form/Control';
import React from 'react';
type Props = {
  customer: any;
  toggleBulk: (target: any, toAdd: boolean) => void;
  isChecked?: boolean;
};

function CustomerRow({ customer, toggleBulk, isChecked }: Props) {
  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(customer, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  return (
    <tr key={customer._id}>
      <td id="customersCheckBox" style={{ width: '50px' }} onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{customer.code}</td>
      <td>{customer.lastName}</td>
      <td>{customer.firstName}</td>
      <td>{customer.phones}</td>
    </tr>
  );
}

export default CustomerRow;
