import gql from 'graphql-tag';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import DirectionForm from '../../components/direction/Form';
import { mutations, queries } from '../../graphql';

type Props = {
  closeModal: () => void;
};

const PropertyGroupFormContainer = (props: Props) => {
  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.addDirection : mutations.editDirection}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a direction`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton
  };

  return <DirectionForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.directions)
    }
  ];
};

export default PropertyGroupFormContainer;
