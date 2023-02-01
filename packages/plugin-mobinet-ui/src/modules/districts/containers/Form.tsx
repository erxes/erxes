import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import gql from 'graphql-tag';
import DistrictForm from '../components/Form';
import { mutations, queries } from '../graphql';

type Props = {
  closeModal: () => void;
};

const DistrictFormContainer = (props: Props) => {
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
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a district`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton
  };

  return <DistrictForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.districtsQuery),
      fetchPolicy: 'network-only'
    }
  ];
};

export default DistrictFormContainer;
