import React from 'react';
import Form from '../components/ResponseForm';
import { Alert, confirm } from '@erxes/ui/src';
import { refetchQueries } from '../../common/utils';
import { mutations } from '../graphql';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client';

type Props = {
  closeModal: () => void;
  contentTypeId: string;
  contentType: string;
  requestId: string;
};

export type IResponse = {
  description: string;
  response: 'approved' | 'declined';
};

const ResponseForm: React.FC<Props> = (props) => {
  const { closeModal, requestId, contentTypeId, contentType } = props;

  const [responseMutation] = useMutation(gql(mutations.responseGrantRequest), {
    refetchQueries: [
      ...refetchQueries({ contentTypeId, contentType }),
      `${contentType}Detail`,
      `${contentType}s`,
    ],
  });

  const response = (doc: IResponse) => {
    confirm().then(() => {
      responseMutation({ variables: { ...doc, requestId } })
        .then(() => {
          Alert.success('Successfully sent the response');
          closeModal();
        })
        .catch((e) => Alert.error(e.message));
    });
  };

  const updatedProps = {
    closeModal,
    response,
  };

  return <Form {...updatedProps} />;
};

export default ResponseForm;
