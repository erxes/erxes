import React from 'react';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import BranchForm from '../../components/branch/Form';
import DepartmentForm from '../../components/department/Form';
import UnitForm from '../../components/unit/Form';

import { mutations, queries } from '@erxes/ui/src/team/graphql';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';
import { IBranch, IDepartment, IUnit } from '@erxes/ui/src/team/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import ErrorMsg from '@erxes/ui/src/components/ErrorMsg';

type Props = {
  branch?: IBranch;
  additionalRefetchQueries?: any[];
  closeModal: () => void;
  queryType: string;
};

const FormContainer = (props: Props) => {
  const { queryType } = props;
  const { data, error, loading } = useQuery(gql(queries[queryType]), {
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
    console.log(object);
    return (
      <ButtonMutate
        mutation={
          object._id
            ? mutations[`${queryType}Edit`]
            : mutations[`${queryType}Add`]
        }
        refetchQueries={[
          {
            query: gql(queries[queryType]),
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

  const item = props.branch;

  const items = item
    ? data[queryType].filter(d => d._id !== item._id)
    : data[queryType];

  if (queryType === 'branches') {
    return (
      <BranchForm branches={items} {...props} renderButton={renderButton} />
    );
  }
  if (queryType === 'departments') {
    return (
      <DepartmentForm
        departments={items}
        {...props}
        renderButton={renderButton}
      />
    );
  } else {
    return (
      <UnitForm departments={items} {...props} renderButton={renderButton} />
    );
  }
};

export default FormContainer;
