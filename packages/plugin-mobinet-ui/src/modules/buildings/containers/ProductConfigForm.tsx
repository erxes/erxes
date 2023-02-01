import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import React from 'react';

import ProductConfigForm from '../components/detail/ProductConfigForm';
import { mutations, queries } from '../graphql';
import { IProductPriceConfig } from '../types';

type Props = {
  buildingId: string;
  productConfigs: IProductPriceConfig[];
  closeModal: () => void;
};

const ProductConfigContainer = (props: Props) => {
  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    const mutation = object ? mutations.editMutation : mutations.addMutation;

    return (
      <ButtonMutate
        mutation={mutation}
        variables={values}
        callback={callback}
        // refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a building`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton
  };

  return <ProductConfigForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.listQuery),
      fetchPolicy: 'network-only'
    }
  ];
};

export default ProductConfigContainer;
