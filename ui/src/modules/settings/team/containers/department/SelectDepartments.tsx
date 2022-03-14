import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { IFormProps } from 'modules/common/types';
import React from 'react';
import { ChildProps, graphql } from 'react-apollo';
import { queries } from '../../graphql';
import { DepartmentsQueryResponse } from '../../types';
import SelectDepartments from '../../components/department/SelectDepartments';

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
