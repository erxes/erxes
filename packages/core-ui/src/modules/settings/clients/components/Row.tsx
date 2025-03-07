import { gql, useMutation } from '@apollo/client';
import { RowTitle } from '@erxes/ui-engage/src/styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Info from '@erxes/ui/src/components/Info';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import copy from 'copy-text-to-clipboard';
import dayjs from 'dayjs';
import React from 'react';
import { Modal } from 'react-bootstrap';
import { FlexRow } from '../../importExport/styles';
import Form from '../containers/Form';
import Alert from '../../../common/utils/Alert';
import Icon from '@erxes/ui/src/components/Icon';

import { CredentialsRow } from '../styles';

const RESET_SECRET_MUTATION = gql`
  mutation ClientsResetSecret($id: String!) {
    clientsResetSecret(_id: $id) {
      clientId
      clientSecret
    }
  }
`;

type Props = {
  index: number;
  client: any;
  remove: (id: string) => void;
  refetch?: any;
};

const Row = (props: Props) => {
  const { client, remove } = props;

  

  const [showModal, setShowModal] = React.useState(false);
  const [newSecret, setNewSecret] = React.useState('');

  const [resetSecret, { loading }] = useMutation(RESET_SECRET_MUTATION, {
    onCompleted: (data) => {
      setNewSecret(data.clientsResetSecret.clientSecret);
      setShowModal(true);
    },
    onError: (error) => {
      Alert.error(error.message);
    },
  });

  const handleResetSecret = () => {
    resetSecret({ variables: { id: client._id } });
  };

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

  const formContent = (formProps) => (
    <Form {...formProps} _id={client._id} refetch={props.refetch} />
  );

  const dateFormat = 'YYYY-MM-DD HH:mm:ss';
  return (
    <tr>
      <td key={Math.random()}>
        <RowTitle>{client.name || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <FlexRow>
          <RowTitle>{client.clientId || '-'}</RowTitle>
          <Button
            btnStyle='link'
            icon='copy-1'
            onClick={() => navigator.clipboard.writeText(client.clientId)}
          />
        </FlexRow>
      </td>

      <td key={Math.random()}>
        <FlexRow>
          <RowTitle>*********</RowTitle>
          {loading ? (
            <p>{__('Aqcuiring new secret')}...</p>
          ) : (
            <Tip text={__('Reset secret')}>
              <Button
                btnStyle='link'
                icon='refresh-1'
                onClick={handleResetSecret}
              />
            </Tip>
          )}
        </FlexRow>
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
      <Modal
        size='xl'
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <Icon icon='key-skeleton-alt' />
            New credentials
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <CredentialsRow>
              <p>
                <strong>Client ID:</strong> {client.clientId}
              </p>

              <Button
                btnStyle='link'
                size='small'
                icon='copy'
                onClick={() => {
                  copy(client.clientId);
                  Alert.success(__('Client ID has been copied to clipboard'));
                }}
              >
                Copy Client ID
              </Button>
            </CredentialsRow>

            <CredentialsRow>
              <p>
                <strong>Secret:</strong> {newSecret}
              </p>

              <Button
                btnStyle='link'
                size='small'
                icon='copy'
                onClick={() => {
                  copy(newSecret);
                  Alert.success(__('Secret has been copied to clipboard'));
                }}
              >
                Copy Secret
              </Button>
            </CredentialsRow>
            <Info type='warning'>
              Save the following credentials in a safe place!
            </Info>
          </>
        </Modal.Body>
      </Modal>
    </tr>
  );
};

export default Row;
