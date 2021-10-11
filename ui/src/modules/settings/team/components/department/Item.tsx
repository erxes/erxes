import React from 'react';

import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Form from '../../containers/department/Form';
import { IDepartment } from '../../types';

type Props = {
  department: IDepartment;
  deleteDepartment: (_id: string, callback: () => void) => void;
  refetch: () => void;
  depth?: number;
};

export default function Item({
  department,
  depth,
  refetch,
  deleteDepartment
}: Props) {
  const renderForm = ({ closeModal }) => {
    return <Form department={department} closeModal={closeModal} />;
  };

  const trigger = (
    <Icon size={10} icon="edit" style={{ paddingRight: '10px' }} />
  );

  const editButton = (
    <ModalTrigger
      content={renderForm}
      title="Edit a department"
      trigger={trigger}
    />
  );

  const generatePrefix = () => {
    let prefix = ' ';

    for (let i = 0; i < (depth || 0); i++) {
      prefix += '--- ';
    }

    return prefix;
  };

  return (
    <li key={department._id} style={{ justifyContent: 'space-between' }}>
      <span>
        {generatePrefix()}
        {department.title}
      </span>
      <span>
        {editButton}
        <Icon
          color="red"
          icon="trash"
          onClick={() => deleteDepartment(department._id, refetch)}
        />
      </span>
    </li>
  );
}
