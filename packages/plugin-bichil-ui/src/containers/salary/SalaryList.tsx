import { router } from '@erxes/ui/src';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { gql, useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { __, Alert, confirm } from '@erxes/ui/src/utils';
import List from '../../components/salary/SalaryList';
import { queries, mutations } from '../../graphql';

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

  const [removeSalary] = useMutation(gql(mutations.removeSalary), {
    variables: { _id: '' },
    refetchQueries: [gql(queries.bichilSalaryReport)]
  });

  const labelsQuery = useQuery(gql(queries.labelsQuery), {
    fetchPolicy: 'cache-first'
  });

  const symbolsQuery = useQuery(gql(queries.symbmolsQuery), {
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

  const remove = (id: string) => {
    const message = __('Are you sure you want to delete this salary?');

    confirm(message).then(() => {
      removeSalary({
        variables: { _id: id }
      })
        .then(() => {
          Alert.success(__('Successfully deleted.'));
          salariesQry.refetch();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const refetch = () => {
    salariesQry.refetch();
  };

  let salaries: any = [];
  let totalCount = 0;

  if (!isEmployeeSalary) {
    salaries = salariesQry.data.bichilSalaryReport.list || [];
    totalCount = salariesQry.data.bichilSalaryReport.totalCount || 0;
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
    symbols: symbolsQuery.data.bichilSalarySymbols || {},
    salaries,
    totalCount,
    isEmployeeSalary,
    remove,
    refetch,
    confirmPassword
  };

  return <List {...extendedProps} />;
}
