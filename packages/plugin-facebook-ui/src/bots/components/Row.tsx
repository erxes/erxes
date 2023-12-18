import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import Form from '../containers/Form';

type Props = {
  bot: any;
  remove: (_id: string) => void;
};

function Row({ bot, remove }: Props) {
  const renderEdit = () => {
    const trigger = <Button btnStyle="link" icon="edit-3" />;

    const content = ({ closeModal }) => {
      return <Form bot={bot} closeModal={closeModal} />;
    };

    return (
      <ModalTrigger
        content={content}
        trigger={trigger}
        hideHeader
        title="Edit Bot"
      />
    );
  };

  return (
    <tr key={bot._id}>
      <td>{__(bot?.name || '-')}</td>
      <td>{__(bot?.account?.name || '-')}</td>
      <td>{__(bot?.page?.name || '-')}</td>
      <td>
        <ActionButtons>
          {renderEdit()}
          <Button
            btnStyle="link"
            icon="times-circle"
            onClick={remove.bind(this, bot._id)}
          />
        </ActionButtons>
      </td>
    </tr>
  );
}

export default Row;
