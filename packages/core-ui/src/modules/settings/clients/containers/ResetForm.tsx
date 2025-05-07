import { gql, useMutation } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import Button from '@erxes/ui/src/components/Button';

import { ModalFooter } from '@erxes/ui/src/styles/main';
import { Modal } from 'react-bootstrap';

type Props = {
  _id: string;
  closeModal: () => void;
};

const MUTATION = gql`
  mutation ClientsResetSecret($_id: String!) {
    clientsResetSecret(_id: $_id) {
      clientId
      clientSecret
    }
  }
`;

const ResetForm = ({ _id, closeModal }: Props) => {
  const [resetSecret, { data, loading, error }] = useMutation(MUTATION);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    resetSecret({ variables: { _id } });
  }, [_id, resetSecret]);

  const handleCopy = () => {
    if (data?.clientsResetSecret?.clientSecret) {
      navigator.clipboard.writeText(data.clientsResetSecret.clientSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal title='Reset Client Secret' closeModal={closeModal}>
      <div>
        {loading && <p>Resetting secret...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
        {data && (
          <>
            <p>
              <strong>Client ID:</strong> {data.clientsResetSecret.clientId}
            </p>
            <p>
              <strong>Client Secret:</strong>{' '}
              {data.clientsResetSecret.clientSecret}
              <Button btnStyle='link' onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </p>
          </>
        )}
      </div>

      <ModalFooter>
        <Button btnStyle='simple' onClick={closeModal} icon='times-circle'>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ResetForm;
