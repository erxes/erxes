import React, { useState } from 'react';
import RequestForm from '../components/RequestForm';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { mutations, queries } from '../graphql';
import { Alert, ButtonMutate, confirm } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { IGrantRequest } from '../../common/type';
import { refetchQueries } from '../../common/utils';
import { gql } from '@apollo/client';
import client from '@erxes/ui/src/apolloClient';
import { useMutation } from '@apollo/client';

type Props = {
  closeModal: () => void;
  contentType: string;
  contentTypeId: string;
  object: any;
  currentUser: IUser;
  request: IGrantRequest;
};

const RequestFormContainer: React.FC<Props> = (props) => {
  const [loading, setLoading] = useState(false);
  const {
    closeModal,
    contentType,
    contentTypeId,
    object,
    currentUser,
    request,
  } = props;
  const [cancelRequest] = useMutation(gql(mutations.cancelRequest), {
    refetchQueries: refetchQueries({ contentTypeId, contentType }),
  });

  const renderButton = ({
    name,
    values,
    isSubmitted,
    confirmationUpdate,
    object,
  }: IButtonMutateProps) => {
    let mutation = mutations.addGrantRequest;
    let successAction = 'added';

    if (object) {
      mutation = mutations.editGrantRequest;
      successAction = 'edited';
    }

    return (
      <ButtonMutate
        disabled={loading}
        mutation={mutation}
        variables={values}
        callback={closeModal}
        isSubmitted={isSubmitted}
        refetchQueries={refetchQueries({ contentTypeId, contentType })}
        type="submit"
        confirmationUpdate={confirmationUpdate}
        successMessage={`You successfully ${successAction} a ${name}`}
      />
    );
  };

  const cancelRequestHandler = () => {
    confirm().then(() => {
      setLoading(true);
      cancelRequest({ variables: { contentTypeId, contentType } })
        .then(() => {
          closeModal();
          Alert.success('Cancelled request successfully');
          setLoading(false);
        })
        .catch((e) => {
          Alert.error(e.message);
          setLoading(false);
        });
    });
  };

  const checkConfig = async ({ contentType, contentTypeId, action, scope }) => {
    return await client
      .query({
        query: gql(queries.checkConfig),
        fetchPolicy: 'network-only',
        variables: { contentType, contentTypeId, action, scope },
      })
      .then(({ data }) => {
        return data.checkGrantActionConfig;
      });
  };

  const updatedProps: any = {
    contentType,
    contentTypeId,
    object,
    currentUser,
    renderButton,
    cancelRequest: cancelRequestHandler,
    checkConfig,
    loading,
  };

  if (!!Object.keys(request).length) {
    updatedProps.request = {
      ...request,
      params: JSON.parse(request?.params || '{}'),
    };
  }

  return <RequestForm {...updatedProps} />;
};

export default RequestFormContainer;
