import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';

import { getGqlString } from '@erxes/ui/src/utils/core';

import TagForm from '../components/Form';
import { mutations, queries } from '../graphql';
import { useSearchParams } from 'react-router-dom';

type Props = {
  clientPortalId: string;
  tag?: any;
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

    if (props.tag) {
      variables._id = props.tag._id;
    }

    return (
      <ButtonMutate
        mutation={getGqlString(
          props.tag ? mutations.TAG_EDIT : mutations.TAG_ADD
        )}
        variables={variables}
        callback={callback}
        refetchQueries={getRefetchQueries(clientPortalId)}
        isSubmitted={isSubmitted}
        type='submit'
        icon='check-circle'
        successMessage={`You successfully ${
          props.tag ? 'updated' : 'added'
        } a tag`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
  };

  return <TagForm {...updatedProps} />;
};

const getRefetchQueries = (clientPortalId?: string) => {
  return [
    {
      query: queries.GET_TAGS,
      variables: {
        clientPortalId,
      },
      
    },
  ];
};

export default FormContainer;
