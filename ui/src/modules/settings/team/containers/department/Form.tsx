import React from 'react';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import Form from '../../components/department/Form';
import { mutations, queries } from '../../graphql';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import { IDepartment } from '../../types';
import Spinner from 'modules/common/components/Spinner';
import ErrorMsg from 'modules/common/components/ErrorMsg';

type Props = {
  department?: IDepartment;
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

  const department = props.department;

  const departments = department
    ? data.departments.filter(d => d._id !== department._id)
    : data.departments;

  return (
    <Form departments={departments} {...props} renderButton={renderButton} />
  );
};

export default FormContainer;
