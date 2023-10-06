import { mutations, queries } from '@erxes/ui/src/team/graphql';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Form from '../../components/unit/Form';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IUnit } from '@erxes/ui/src/team/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';

type Props = {
  unit?: IUnit;
  closeModal: () => void;
};

const FormContainer = (props: Props) => {
  const { data, loading } = useQuery(gql(queries.departments), {
    fetchPolicy: 'network-only'
  });

  if (loading) {
    return <Spinner />;
  }

  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
    callback
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object._id ? mutations.unitsEdit : mutations.unitsAdd}
        refetchQueries={[
          {
            query: gql(queries.units)
          }
        ]}
        variables={values}
        isSubmitted={isSubmitted}
        type="submit"
        callback={callback}
        successMessage={`You successfully ${
          object._id ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  return (
    <Form
      departments={data.departments}
      {...props}
      renderButton={renderButton}
    />
  );
};

export default FormContainer;
