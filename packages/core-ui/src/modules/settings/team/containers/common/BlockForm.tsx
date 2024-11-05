import { mutations, queries } from '@erxes/ui/src/team/graphql';

import BranchForm from '../../components/branch/Form';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import DepartmentForm from '../../components/department/Form';
import PositionForm from '../../components/position/Form';
import ErrorMsg from '@erxes/ui/src/components/ErrorMsg';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import UnitForm from '../../containers/unit/Form';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';

type Props = {
  itemId?: string;
  closeModal: () => void;
  additionalRefetchQueries?: any[];
  queryType?: any;
  showMainList?: boolean;
};

const configs = {
  branches: { query: queries.branchDetail, field: 'branchDetail' },
  departments: { query: queries.departmentDetail, field: 'departmentDetail' },
  units: { query: queries.unitDetail, field: 'unitDetail' },
  positions: { query: queries.postionDetail, field: 'positionDetail' },
};

const FormContainer = ({
  queryType,
  itemId,
  showMainList,
  additionalRefetchQueries,
  closeModal,
}: Props) => {
  let item;

  if (itemId) {
    const { query, field } = configs[queryType];
    const {
      data = {},
      error,
      loading,
    } = useQuery(gql(query), {
      variables: { _id: itemId },
      fetchPolicy: 'network-only',
    });

    if (loading) {
      return <Spinner />;
    }

    if (error) {
      return <ErrorMsg>{error.message}</ErrorMsg>;
    }
    item = data[field] || {};
  }

  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
    callback,
  }: IButtonMutateProps) => {
    const qType =
      queryType === 'units' && showMainList ? 'unitsMain' : queryType;

    return (
      <ButtonMutate
        mutation={
          object._id
            ? mutations[`${queryType}Edit`]
            : mutations[`${queryType}Add`]
        }
        refetchQueries={[
          {
            query: gql(queries[qType]),
            variables: {
              withoutUserFilter: true,
              searchValue: undefined,
            },
          },
          ...(additionalRefetchQueries || []),
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
        // items={items}
        closeModal={closeModal}
        renderButton={renderButton}
      />
    );
  }

  if (queryType === 'branches') {
    return (
      <BranchForm
        item={item}
        // items={items}
        closeModal={closeModal}
        renderButton={renderButton}
      />
    );
  }

  if (queryType === 'positions') {
    return (
      <PositionForm
        item={item}
        // items={items}
        closeModal={closeModal}
        renderButton={renderButton}
      />
    );
  }

  return null;
};

export default FormContainer;
