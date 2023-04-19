import { RowTitle } from '@erxes/ui-engage/src/styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

type Props = {
  salary: any;
  remove: (id: string) => void;
};

const Row = (props: Props) => {
  const { salary, remove } = props;

  const renderRemoveAction = () => {
    const onClick = () => {
      remove(salary._id);
    };

    return (
      <Tip text={__('Delete')} placement="top">
        <Button
          id="configDelete"
          btnStyle="link"
          onClick={onClick}
          icon="times-circle"
        />
      </Tip>
    );
  };

  return (
    <tr>
      <td key={Math.random()}>
        <RowTitle>{salary.name || '-'}</RowTitle>
      </td>
      <td>
        <ActionButtons>{renderRemoveAction()}</ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
