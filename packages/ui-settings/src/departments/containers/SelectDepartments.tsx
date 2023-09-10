import Spinner from '@erxes/ui/src/components/Spinner';
import { IFormProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql, ChildProps } from '@apollo/client/react/hoc';
import SelectDepartments from '../components/SelectDepartments';
import { queries } from '../graphql';
import { DepartmentsQueryResponse } from '../types';

type Props = {
  onChange: (values: string[]) => void;
  defaultValue: string[];
  isRequired?: boolean;
  formProps: IFormProps;
};

type FinalProps = {
  departmentsQuery: DepartmentsQueryResponse;
} & Props;

const SelectDepartmentsContainer = (props: ChildProps<FinalProps>) => {
  const { departmentsQuery } = props;

  const departments = departmentsQuery.departments || [];

  if (departmentsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const updatedProps = {
    ...props,
    departments
  };

  return <SelectDepartments {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.departments),
      variables: {}
    }
  ];
};

export default compose(
  graphql<DepartmentsQueryResponse>(gql(queries.departments), {
    name: 'departmentsQuery',
    options: () => ({
      refetchQueries: getRefetchQueries
    })
  })
)(SelectDepartmentsContainer);
