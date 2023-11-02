import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';

import { getGqlString } from '@erxes/ui/src/utils/core';
import { InsuranceCategory, InsuranceProduct } from '../../../gql/types';
import ProductForm from '../components/Form';
import { mutations, queries } from '../graphql';

type Props = {
  category?: InsuranceCategory;
  closeModal: () => void;
};

const FormContainer = (props: Props) => {
  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={getGqlString(
          props.category ? mutations.CATEGORY_EDIT : mutations.CATEGORY_ADD
        )}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={`You successfully ${
          props.category ? 'updated' : 'added'
        } a category`}
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
      query: queries.CATEGORY_LIST
    }
  ];
};

export default FormContainer;
