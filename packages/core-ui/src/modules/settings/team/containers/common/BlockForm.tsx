import { mutations, queries } from '@erxes/ui/src/team/graphql';

import BranchForm from '../../components/branch/Form';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import DepartmentForm from '../../components/department/Form';
import ErrorMsg from '@erxes/ui/src/components/ErrorMsg';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import UnitForm from '../../containers/unit/Form';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';

type Props = {
  item?: any;
  closeModal: () => void;
  additionalRefetchQueries?: any[];
  queryType?: any;
};

const FormContainer = ({
  queryType,
  item,
  additionalRefetchQueries,
  closeModal
}: Props) => {
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
          ...(additionalRefetchQueries || [])
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

  const items = item
    ? data[queryType].filter(d => d._id !== item._id)
    : data[queryType];

  if (queryType === 'units') {
    return (
      <UnitForm
        item={item}
        closeModal={closeModal}
        renderButton={renderButton}
      />
    );
  }

  if (queryType === 'departments') {
    return (
      <DepartmentForm
        item={item}
        items={items}
        closeModal={closeModal}
        renderButton={renderButton}
      />
    );
  }

  if (queryType === 'branches') {
    return (
      <BranchForm
        item={item}
        items={items}
        closeModal={closeModal}
        renderButton={renderButton}
      />
    );
  }

  return null;
};

export default FormContainer;
