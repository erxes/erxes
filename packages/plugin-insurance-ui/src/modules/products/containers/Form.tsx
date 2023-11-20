import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';

import { getGqlString } from '@erxes/ui/src/utils/core';
import { InsuranceProduct } from '../../../gql/types';
import ProductForm from '../components/Form';
import { mutations, queries } from '../graphql';

type Props = {
  product?: InsuranceProduct;
  closeModal: () => void;
};

const ProductFormContainer = (props: Props) => {
  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={getGqlString(
          props.product ? mutations.PRODUCTS_EDIT : mutations.PRODUCTS_ADD
        )}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={`You successfully ${
          props.product ? 'updated' : 'added'
        } a product`}
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
      query: queries.PRODUCTS_PAGINATED
    }
  ];
};

export default ProductFormContainer;
