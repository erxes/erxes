import React from 'react';

import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Form from '../../containers/unit/Form';
import { IUnit } from '../../types';

type Props = {
  unit: IUnit;
  deleteDepartment: (_id: string, callback: () => void) => void;
  refetch: () => void;
};

export default function Item({ unit, refetch, deleteDepartment }: Props) {
  const renderForm = ({ closeModal }) => {
    return <Form unit={unit} closeModal={closeModal} />;
  };

  const trigger = (
    <Icon size={10} icon="edit" style={{ paddingRight: '10px' }} />
  );

  const editButton = (
    <ModalTrigger content={renderForm} title="Edit a unit" trigger={trigger} />
  );

  return (
    <li key={unit._id} style={{ justifyContent: 'space-between' }}>
      <span>{unit.title}</span>
      <span>
        {editButton}
        <Icon
          color="red"
          icon="trash"
          onClick={() => deleteDepartment(unit._id, refetch)}
        />
      </span>
    </li>
  );
}
