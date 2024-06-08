import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { gql, useQuery } from '@apollo/client';
import FormDetail from '../components/Form';
import { mutations, queries } from '../graphql';
import { DetailQueryResponse } from '../types';

type Props = {
  closeModal: () => void;
};

const ConfigFormContainer = (props: Props) => {

    const scoreDetail = useQuery<DetailQueryResponse>(
        gql(queries.getCustomerScore),
        {
            customerId: customerId,
        }
      );
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
        } a config`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton
  };

  return <FormDetail {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.getCustomerScore),
      fetchPolicy: 'network-only'
    }
  ];
};

export default ConfigFormContainer;
