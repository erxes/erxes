import React from 'react';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import BranchForm from '../../components/common/Form';
import { mutations, queries } from '@erxes/ui/src/team/graphql';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';
import Spinner from '@erxes/ui/src/components/Spinner';
import ErrorMsg from '@erxes/ui/src/components/ErrorMsg';

type Props = {
  item?: any;
  closeModal: () => void;
  additionalRefetchQueries?: any[];
  queryType?: any;
};

const FormContainer = (props: Props) => {
  const { queryType, item } = props;
  const { data, error, loading } = useQuery(gql(queries[queryType]), {
    fetchPolicy: 'network-only'
  });
  const { data: departmentsData } = useQuery(gql(queries['departments'])); // Moved outside of conditional

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

  let departments = [];

  if (queryType === 'units') {
    departments =
      departmentsData && departmentsData['departments']
        ? departmentsData['departments']
        : [];
  }

  const items = item
    ? data[queryType].filter(d => d._id !== item._id)
    : data[queryType];

  return (
    <BranchForm
      items={items}
      item={item}
      {...props}
      renderButton={renderButton}
      type={queryType}
      departments={departments}
    />
  );
};

export default FormContainer;
