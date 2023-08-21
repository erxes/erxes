import React from 'react';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import Form from '../../components/branch/Form';
import { mutations, queries } from '@erxes/ui/src/team/graphql';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';
import { IBranch } from '@erxes/ui/src/team/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import ErrorMsg from '@erxes/ui/src/components/ErrorMsg';

type Props = {
  branch?: IBranch;
  closeModal: () => void;
  additionalRefetchQueries?: any[];
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
            query: gql(queries.branches),
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

  const branch = props.branch;

  const branches = branch
    ? data.branches.filter(d => d._id !== branch._id)
    : data.branches;

  return <Form branches={branches} {...props} renderButton={renderButton} />;
};

export default FormContainer;
