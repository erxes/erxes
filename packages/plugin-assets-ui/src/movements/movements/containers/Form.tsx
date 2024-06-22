import { ButtonMutate, Spinner } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { IMovementDetailQueryResponse } from '../../../common/types';
import { movementRefetchQueries } from '../../../common/utils';
import Form from '../components/Form';
import { mutations, queries } from '../graphql';

type Props = {
  movementId?: string;
  assetId?: string;
  closeModal: () => void;
  queryParams: any;
};

const FormContainer = (props: Props) => {
  const { closeModal, assetId, movementId, queryParams } = props;

  const movementDetail = useQuery<IMovementDetailQueryResponse>(
    gql(queries.movementDetail),
    {
      variables: { _id: movementId },
      fetchPolicy: 'network-only',
    },
  );

  const renderButton = ({
    text,
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    let mutation = mutations.movementAdd;
    if (object) {
      mutation = mutations.movementEdit;
    }

    return (
      <ButtonMutate
        mutation={mutation}
        variables={values}
        callback={callback}
        refetchQueries={movementRefetchQueries(queryParams)}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
        successMessage={`You successfully added a ${text}`}
      />
    );
  };

  if (movementDetail && movementDetail.loading) {
    return <Spinner objective />;
  }

  const updatedProps = {
    detail: movementDetail?.data?.assetMovement || {},
    closeModal,
    renderButton,
    assetId,
    movementId,
  };

  return <Form {...updatedProps} />;
};

export default FormContainer;
