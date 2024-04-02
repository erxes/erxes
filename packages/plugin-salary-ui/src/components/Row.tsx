import { RowTitle } from '@erxes/ui-engage/src/styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

type Props = {
  salary: any;
  keys: any[];
  symbols: any;
  isEmployeeSalary?: boolean;
  remove: (id: string) => void;
};

const Row = (props: Props) => {
  const { salary, keys, symbols } = props;

  // TODO: discuss with bichil then implement
  const renderRemoveAction = () => {
    const onClick = () => {
      props.remove(salary._id);
    };

    return (
      <Tip text={__('Delete')} placement='top'>
        <Button
          id='configDelete'
          btnStyle='link'
          onClick={onClick}
          icon='times-circle'
        />
      </Tip>
    );
  };

  const branches =
    (salary && salary.employee && salary.employee.branches) || [];

  const branchesList = branches.map(branch => <div>{branch.title}</div>);
  const position = salary.employee ? salary.employee.details.position : '-';

  const fullName = salary.employee
    ? salary.employee.details.lastName + ' ' + salary.employee.details.firstName
    : '-';

  return (
    <tr>
      <td key={Math.random()}>
        <RowTitle>{salary.title || '-'}</RowTitle>
      </td>

      <td key={salary.employeeId}>
        <RowTitle>{salary.employeeId || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{branchesList || '-'}</RowTitle>
      </td>

      <td key={position}>
        <RowTitle>{position || '-'}</RowTitle>
      </td>

      <td key={fullName}>
        <RowTitle>{fullName || '-'}</RowTitle>
      </td>

      {keys.map(key => (
        <td key={key}>
          <RowTitle>
            {Number(salary[key]).toLocaleString() + ' ' + symbols[key] || '-'}
          </RowTitle>
        </td>
      ))}

      {!props.isEmployeeSalary && (
        <td>
          <ActionButtons>{renderRemoveAction()}</ActionButtons>
        </td>
      )}
    </tr>
  );
};

export default Row;
