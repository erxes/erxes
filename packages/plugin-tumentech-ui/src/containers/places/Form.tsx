import gql from 'graphql-tag';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import PlaceForm from '../../components/places/Form';
import { mutations, queries } from '../../graphql';

type Props = {
  closeModal: () => void;
};

const PlaceFormContainer = (props: Props) => {
  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.editPlace : mutations.addPlace}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a place`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton
  };

  return <PlaceForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.placesQuery)
    }
  ];
};

export default PlaceFormContainer;
