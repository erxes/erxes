import From from '../components/Form';
import React from 'react';
import { ButtonMutate } from '@erxes/ui/src/components';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IReserveRem } from '../types';
import { mutations } from '../graphql';

type Props = {
  reserveRem?: IReserveRem;
  closeModal: () => void;
};

const ProductFormContainer: React.FC<Props> = (props) => {
  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.reserveRemsAdd}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
        successMessage={`You successfully created a day labels}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
  };

  return <From {...updatedProps} />;
};

const getRefetchQueries = () => {
  return ['reserveRems', 'reserveRemsCount'];
};

export default ProductFormContainer;
