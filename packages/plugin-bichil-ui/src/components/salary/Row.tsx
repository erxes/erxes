import { RowTitle } from '@erxes/ui-engage/src/styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

type Props = {
  salary: any;
  keys: any[];
};

const Row = (props: Props) => {
  const { salary, keys } = props;

  // TODO: discuss with bichil then implement
  // const renderRemoveAction = () => {
  //   const onClick = () => {
  //     remove(salary._id);
  //   };

  //   return (
  //     <Tip text={__('Delete')} placement="top">
  //       <Button
  //         id="configDelete"
  //         btnStyle="link"
  //         onClick={onClick}
  //         icon="times-circle"
  //       />
  //     </Tip>
  //   );
  // };

  const branches =
    (salary && salary.employee && salary.employee.branches) || [];

  const branchText = branches
    .map(branch => branch.name)
    .join(', ')
    .slice(0, -1);
  const position = salary.employee
    ? salary.employee.details.position.name
    : '-';

  const fullName = salary.employee
    ? salary.employee.details.lastName + ' ' + salary.employee.details.firstName
    : '-';

  return (
    <tr>
      <td key={'title'}>
        <RowTitle>{salary.title || '-'}</RowTitle>
      </td>

      <td key={'department'}>
        <RowTitle>{branchText || '-'}</RowTitle>
      </td>

      <td key={'position'}>
        <RowTitle>{position || '-'}</RowTitle>
      </td>

      <td key={'fullName'}>
        <RowTitle>{fullName || '-'}</RowTitle>
      </td>

      {keys.map(key => (
        <td key={key}>
          <RowTitle>{Number(salary[key]).toLocaleString() || '-'}</RowTitle>
        </td>
      ))}

      {/*
        TODO: discuss with bichil then implement this
      <td>
        <ActionButtons>{renderRemoveAction()}</ActionButtons>
      </td> */}
    </tr>
  );
};

export default Row;
