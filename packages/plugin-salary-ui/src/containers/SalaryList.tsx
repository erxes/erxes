import { router } from '@erxes/ui/src';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { gql, useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { __, Alert, confirm } from '@erxes/ui/src/utils';
import List from '../components/SalaryList';
import { queries, mutations } from '../graphql';
import { generateParams } from '../utils';

type Props = {
  refetch?: () => void;
  history?: any;
  queryParams: any;

  getActionBar: (actionBar: any) => void;
  showSideBar: (sideBar: boolean) => void;
  getPagination: (pagination: any) => void;
  setLoading: (loading: boolean) => void;
  setEmptyContentButton: (content: any) => void;
} & IRouterProps;

export default function ListContainer(props: Props) {
  const isEmployeeSalary =
    props.history.location.pathname === '/profile/salaries';

  const variables: any = {
    ...router.generatePaginationParams(props.queryParams || {}),
    ...generateParams(props.queryParams || {})
  };

  const salariesQry = useQuery(gql(queries.salaryReport), {
    variables: {
      ...variables
    },
    skip: isEmployeeSalary,
    fetchPolicy: 'network-only'
  });

  const [removeSalary] = useMutation(gql(mutations.removeSalary), {
    variables: { _id: '' },
    refetchQueries: [gql(queries.salaryReport)]
  });

  const labelsQuery = useQuery(gql(queries.labelsQuery), {
    fetchPolicy: 'cache-first'
  });

  const symbolsQuery = useQuery(gql(queries.symbolsQuery), {
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

  if (
    loading ||
    labelsQuery.loading ||
    salariesQry.loading ||
    symbolsQuery.loading
  ) {
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
    salaries = salariesQry.data.salaryReport.list || [];
    totalCount = salariesQry.data.salaryReport.totalCount || 0;
  }

  if (isEmployeeSalary) {
    salaries = (data && data.salaryByEmployee.list) || [];
    totalCount = (data && data.salaryByEmployee.totalCount) || 0;

    if (error) {
      Alert.error(error.message);
    }
  }

  const labels = labelsQuery.data.salaryLabels || {};
  const symbols = symbolsQuery.data.salarySymbols || {};

  const extendedProps = {
    ...props,
    loading:
      loading ||
      labelsQuery.loading ||
      salariesQry.loading ||
      symbolsQuery.loading,
    labels,
    symbols,
    salaries,
    totalCount,
    isEmployeeSalary,
    remove,
    refetch,
    confirmPassword
  };

  return <List {...extendedProps} />;
}
