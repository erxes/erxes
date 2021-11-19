import React from 'react';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import Form from '../../components/department/Form';
import { mutations, queries } from '../../graphql';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import { IDepartment } from '../../types';
import Spinner from 'modules/common/components/Spinner';

type Props = {
  department?: IDepartment;
  closeModal: () => void;
};

const FormContainer = (props: Props) => {
  const { data, loading } = useQuery(gql(queries.departments), {
    variables: { depthType: 'parent' },
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

  return (
    <Form
      parentDepartments={data.departments}
      {...props}
      renderButton={renderButton}
    />
  );
};

export default FormContainer;
