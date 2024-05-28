import React from 'react';
import moment from 'moment';
import { ActionButtons, Button, Icon, ModalTrigger } from '@erxes/ui/src';
import Form from '../containers/Form';
import { SafetyTip } from '../types';

type Props = {
  item: SafetyTip;
  remove: (_id: string) => void;
};

export default function Row({ item, remove }: Props) {
  const renderEditForm = () => {
    const trigger = (
      <Button btnStyle="link">
        <Icon icon="edit-3" />
      </Button>
    );

    const content = ({ closeModal }) => (
      <Form closeModal={closeModal} safetyTip={item} />
    );

    return (
      <ModalTrigger
        title="Edit Safety Tip"
        trigger={trigger}
        content={content}
      />
    );
  };

  const actionBar = () => (
    <ActionButtons>
      {renderEditForm()}
      <Button btnStyle="link" onClick={remove.bind(this, item._id)}>
        <Icon icon="multiply" />
      </Button>
    </ActionButtons>
  );

  return (
    <tr>
      <td>{item.name || '-'}</td>
      <td>
        {item?.createdAt ? moment(item.createdAt).format('ll HH:mm') : '-'}
      </td>
      <td>{actionBar()}</td>
    </tr>
  );
}
