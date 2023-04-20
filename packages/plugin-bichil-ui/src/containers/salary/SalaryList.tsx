import { router } from '@erxes/ui/src';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IRouterProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import React from 'react';
import { useQuery, useLazyQuery } from 'react-apollo';
import { __, Alert, confirm } from '@erxes/ui/src/utils';
import List from '../../components/salary/SalaryList';
import { queries } from '../../graphql';

type Props = {
  refetch?: () => void;
  history?: any;
  queryParams: any;
} & IRouterProps;

export default function ListContainer(props: Props) {
  const isEmployeeSalary =
    props.history.location.pathname === '/profile/salaries/bichil';

  const variables: any = {
    ...router.generatePaginationParams(props.queryParams || {})
  };

  const salariesQry = useQuery(gql(queries.bichilSalaryReport), {
    variables: {
      ...variables
    },
    skip: isEmployeeSalary,
    fetchPolicy: 'network-only'
  });

  const labelsQuery = useQuery(gql(queries.labelsQuery), {
    fetchPolicy: 'cache-first'
  });

  const [getEmployeeSalary, { data, loading, error }] = useLazyQuery(
    gql(queries.salaryByEmployee),
    {
      fetchPolicy: 'network-only',
      variables: {
        password: ''
      }
    }
  );

  if (loading || labelsQuery.loading || salariesQry.loading) {
    return <Spinner />;
  }

  const confirmPassword = () => {
    const message = 'Please enter your password to confirm this action.';

    confirm(message, { hasPasswordConfirm: true })
      .then(password => {
        getEmployeeSalary({
          variables: {
            password: password as string
          }
        });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  let salaries: any = [];
  let totalCount = 0;

  if (!isEmployeeSalary) {
    salaries = salariesQry.data.bichilSalaryReport || [];
    totalCount = salariesQry.data.bichilSalaryReport.length || 0;
  }

  if (isEmployeeSalary) {
    salaries = (data && data.bichilSalaryByEmployee.list) || [];
    totalCount = (data && data.bichilSalaryByEmployee.totalCount) || 0;

    if (error) {
      Alert.error(error.message);
    }
  }

  const extendedProps = {
    ...props,
    labels: labelsQuery.data.bichilSalaryLabels || {},
    salaries,
    totalCount,
    isEmployeeSalary,
    confirmPassword
  };

  return <List {...extendedProps} />;
}
