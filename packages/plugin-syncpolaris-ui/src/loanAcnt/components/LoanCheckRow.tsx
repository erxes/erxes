import FormControl from '@erxes/ui/src/components/form/Control';
import React from 'react';
type Props = {
  loan: any;
  toggleBulk: (target: any, toAdd: boolean) => void;
  isChecked?: boolean;
};

function LoanRow({ loan, toggleBulk, isChecked }: Props) {
  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(loan, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  return (
    <tr key={loan._id}>
      <td id="loansCheckBox" style={{ width: '50px' }} onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{loan.number}</td>
      <td>{loan.status}</td>
      <td>{loan.startDate}</td>
      <td>{loan.endDate}</td>
    </tr>
  );
}

export default LoanRow;
