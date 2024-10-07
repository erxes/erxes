import { gql, useQuery } from '@apollo/client';
import { ButtonMutate, Spinner } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { refetchQueries } from '../common/utilss';
import FormComponent from '../components/Form';
import { mutations, queries } from '../graphql';

type Props = {
  _id?: string;
  queryParams: any;
};
const fetchDetail = (_id?: string) => {
  if (!_id) {
    return null;
  }

  const { data, loading, error } = useQuery(gql(queries.getFullDetail), {
    variables: { _id },
  });

  return { detail: data?.riskIndicatorsGroup, loading, error };
};

function Form({ _id, queryParams }: Props) {
  const response = fetchDetail(_id);

  if (response?.loading) {
    return <Spinner />;
  }

  const renderButton = ({
    values,
    text,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.updateGroups : mutations.addGroups}
        variables={values}
        callback={callback}
        refetchQueries={refetchQueries(queryParams || {})}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${text}`}
      />
    );
  };

  const updatedProps = {
    queryParams,
    detail: response?.detail,
    renderButton,
  };

  return <FormComponent {...updatedProps} />;
}

export default Form;
