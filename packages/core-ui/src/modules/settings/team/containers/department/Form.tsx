import React from 'react';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import Form from '../../components/department/Form';
import { mutations, queries } from '@erxes/ui/src/team/graphql';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';
import { IDepartment } from '@erxes/ui/src/team/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import ErrorMsg from '@erxes/ui/src/components/ErrorMsg';

type Props = {
  department?: IDepartment;
  additionalRefetchQueries?: any[];
  closeModal: () => void;
};

const FormContainer = (props: Props) => {
  const { data, loading, error } = useQuery(gql(queries.departments), {
    fetchPolicy: 'network-only'
  });

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorMsg>{error.message}</ErrorMsg>;
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
          object._id ? mutations.departmentsEdit : mutations.departmentsAdd
        }
        refetchQueries={[
          {
            query: gql(queries.departments),
            variables: {
              withoutUserFilter: true,
              searchValue: undefined
            }
          },
          ...(props.additionalRefetchQueries || [])
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

  const department = props.department;

  const departments = department
    ? data.departments.filter(d => d._id !== department._id)
    : data.departments;

  return (
    <Form departments={departments} {...props} renderButton={renderButton} />
  );
};

export default FormContainer;
