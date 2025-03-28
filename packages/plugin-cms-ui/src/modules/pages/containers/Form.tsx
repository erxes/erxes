import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';

import { getGqlString } from '@erxes/ui/src/utils/core';

import PageForm from '../components/Form';
import { mutations, queries } from '../graphql';
import { useSearchParams } from 'react-router-dom';

type Props = {
  clientPortalId: string;
  page?: any;
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

    if (props.page) {
      variables.id = props.page._id;
    }

    return (
      <ButtonMutate
        mutation={getGqlString(
          props.page ? mutations.PAGE_EDIT : mutations.PAGE_ADD
        )}
        variables={variables}
        callback={callback}
        refetchQueries={getRefetchQueries(clientPortalId)}
        isSubmitted={isSubmitted}
        type='submit'
        icon='check-circle'
        successMessage={`You successfully ${
          props.page ? 'updated' : 'added'
        } a page`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
  };

  return <PageForm {...updatedProps} />;
};

const getRefetchQueries = (clientPortalId?: string) => {
  return [
    {
      query: queries.PAGE_LIST,
      variables: {
        clientPortalId,
      },
      
    },
  ];
};

export default FormContainer;
