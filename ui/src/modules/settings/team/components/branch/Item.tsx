import React from 'react';

import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Form from '../../containers/branch/Form';
import { IBranch } from '../../types';

type Props = {
  branch: IBranch;
  deleteBranch: (_id: string, callback: () => void) => void;
  refetch: () => void;
  depth?: number;
};

export default function Item({ branch, depth, refetch, deleteBranch }: Props) {
  const renderForm = ({ closeModal }) => {
    return <Form branch={branch} closeModal={closeModal} />;
  };

  const trigger = (
    <Icon size={10} icon="edit" style={{ paddingRight: '10px' }} />
  );

  const editButton = (
    <ModalTrigger
      content={renderForm}
      title="Edit a branch"
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
    <li key={branch._id} style={{ justifyContent: 'space-between' }}>
      <span>
        {generatePrefix()}
        {branch.title}
      </span>
      <span>
        {editButton}
        <Icon
          color="red"
          icon="trash"
          onClick={() => deleteBranch(branch._id, refetch)}
        />
      </span>
    </li>
  );
}
