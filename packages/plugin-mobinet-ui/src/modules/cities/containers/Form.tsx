import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import gql from 'graphql-tag';
import CityForm from '../components/Form';
import { mutations, queries } from '../graphql';

type Props = {
  closeModal: () => void;
};

const CityFormContainer = (props: Props) => {
  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    const mutation = object
      ? mutations.citiesEditMutation
      : mutations.citiesAddMutation;

    return (
      <ButtonMutate
        mutation={mutation}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a city`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton
  };

  return <CityForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.listQuery),
      fetchPolicy: 'network-only'
    }
  ];
};

export default CityFormContainer;
