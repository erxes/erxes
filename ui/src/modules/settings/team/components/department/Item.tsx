import React from 'react';

import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Form from '../../containers/department/Form';
import { IDepartment } from '../../types';
import { ActionButtons } from 'modules/settings/styles';
import Tip from 'modules/common/components/Tip';
import Button from 'modules/common/components/Button';
import { __ } from 'modules/common/utils';
import { SideList } from '../../styles';

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
    <Button btnStyle="link">
      <Tip text={__('Edit')} placement="bottom">
        <Icon icon="edit" />
      </Tip>
    </Button>
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
    <SideList key={department._id} isActive={false}>
      <span>
        {generatePrefix()}
        {department.title}
      </span>
      <ActionButtons>
        {editButton}
        <Tip text="Delete" placement="bottom">
          <Button
            btnStyle="link"
            onClick={() => deleteDepartment(department._id, refetch)}
            icon="cancel-1"
          />
        </Tip>
      </ActionButtons>
    </SideList>
  );
}
