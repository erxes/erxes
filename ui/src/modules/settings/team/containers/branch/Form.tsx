import React from 'react';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import Form from '../../components/branch/Form';
import { mutations, queries } from '../../graphql';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import { IBranch } from '../../types';
import Spinner from 'modules/common/components/Spinner';
import ErrorMsg from 'modules/common/components/ErrorMsg';

type Props = {
  branch?: IBranch;
  closeModal: () => void;
};

const FormContainer = (props: Props) => {
  const { data, error, loading } = useQuery(gql(queries.branches), {
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
        mutation={object._id ? mutations.branchesEdit : mutations.branchesAdd}
        refetchQueries={[
          {
            query: gql(queries.branches)
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

  const branch = props.branch;

  const branches = branch
    ? data.branches.filter(d => d._id !== branch._id)
    : data.branches;

  return <Form branches={branches} {...props} renderButton={renderButton} />;
};

export default FormContainer;
