import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';

import { getGqlString } from '@erxes/ui/src/utils/core';

import ProductForm from '../components/Form';
import { mutations, queries } from '../graphql';
import { useSearchParams } from 'react-router-dom';

type Props = {
  post?: any;
  closeModal: () => void;
};

const FormContainer = (props: Props) => {
  const [searchParams] = useSearchParams();
  const clientPortalId = searchParams.get('cpid');

  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    const input = {
      ...values,
      clientPortalId
    };

    const variables :any= {
      input
    }

    if (props.post) {
      variables._id = props.post._id;
    }

    return (
      <ButtonMutate
        mutation={getGqlString(
          props.post ? mutations.CATEGORY_EDIT : mutations.CATEGORY_ADD
        )}
        variables={variables}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={`You successfully ${
          props.post ? 'updated' : 'added'
        } a post`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton
  };

  return <ProductForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: queries.POST_LIST
    }
  ];
};

export default FormContainer;
