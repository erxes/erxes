import { RowTitle } from '@erxes/ui-engage/src/styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import dayjs from 'dayjs';
import React from 'react';
import Form from '../containers/Form';

type Props = {
  index: number;
  client: any;
  remove: (id: string) => void;
};

const Row = (props: Props) => {
  const { client, remove } = props;

  const renderRemoveAction = () => {
    const onClick = () => {
      remove(client._id);
    };

    return (
      <Tip text={__('Delete')} placement='top'>
        <Button
          id='clientDelete'
          btnStyle='link'
          onClick={onClick}
          icon='times-circle'
        />
      </Tip>
    );
  };

  const formContent = (props) => <Form {...props} client={client} />;

  const dateFormat = 'YYYY-MM-DD HH:mm:ss';
  return (
    <tr>
      <td key={Math.random()}>
        <RowTitle>{client.name || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{client.appId || '-'}</RowTitle>
      </td>

      <td>{dayjs(client.createdAt).format(dateFormat)}</td>

      <td>
        <ActionButtons>
          <ModalTrigger
            title={'Edit application'}
            trigger={<Button btnStyle='link' icon='edit-3' />}
            content={formContent}
            size={'xl'}
          />
          {renderRemoveAction()}
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
