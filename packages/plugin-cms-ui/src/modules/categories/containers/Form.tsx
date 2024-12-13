import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';

import { getGqlString } from '@erxes/ui/src/utils/core';

import CategoryForm from '../components/Form';
import { mutations, queries } from '../graphql';
import { useSearchParams } from 'react-router-dom';

type Props = {
  clientPortalId: string;
  category?: any;
  closeModal: () => void;
  refetch?: () => void;
};

const FormContainer = (props: Props) => {
  const [searchParams] = useSearchParams();
  const { clientPortalId } = props;

  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    const input = {
      ...values,
      clientPortalId,
    };

    const variables: any = {
      input,
    };

    if (props.category) {
      variables._id = props.category._id;
    }

    return (
      <ButtonMutate
        mutation={getGqlString(
          props.category ? mutations.CATEGORY_EDIT : mutations.CATEGORY_ADD
        )}
        variables={variables}
        callback={callback}
        refetchQueries={getRefetchQueries(clientPortalId)}
        isSubmitted={isSubmitted}
        type='submit'
        icon='check-circle'
        successMessage={`You successfully ${
          props.category ? 'updated' : 'added'
        } a category`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
  };

  return <CategoryForm {...updatedProps} />;
};

const getRefetchQueries = (clientPortalId?: string) => {
  return [
    {
      query: queries.GET_CATEGORIES,
      variables: {
        clientPortalId,
      },
      
    },
  ];
};

export default FormContainer;
