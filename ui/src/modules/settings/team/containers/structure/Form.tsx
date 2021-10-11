import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import { IButtonMutateProps } from 'modules/common/types';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { mutations, queries } from '../../graphql';
import Form from '../../components/structure/Form';

export default function FormContainer() {
  const { data, loading } = useQuery(gql(queries.structureDetail), {
    fetchPolicy: 'network-only'
  });

  if (loading) {
    return <div>...</div>;
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
        mutation={
          object._id ? mutations.structuresEdit : mutations.structuresAdd
        }
        refetchQueries={[
          {
            query: gql(queries.departments)
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

  return <Form structure={data.structureDetail} renderButton={renderButton} />;
}
