import { gql } from '@apollo/client';
import { Bulk, Alert, router } from '@erxes/ui/src';
import React, { useState } from 'react';
import ContractList from '../components/list/ContractsList';
import { mutations, queries } from '../graphql';
import queryString from 'query-string';
import { MainQueryResponse, RemoveMutationResponse } from '../types';
import { FILTER_PARAMS_CONTRACT } from '../../constants';
import { useQuery, useMutation } from '@apollo/client';

type Props = {
  queryParams: any;
  history: any;
};

type SavingAlert = { name: string; count: number; filter: any };

const generateQueryParams = ({ location }) => {
  return queryString.parse(location.search);
};

const ContractListContainer = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const { queryParams, history } = props;

  const contractsMainQuery = useQuery<MainQueryResponse>(
    gql(queries.contractsMain),
    {
      variables: {
        ...router.generatePaginationParams(queryParams || {}),
        ids: queryParams.ids,
        searchValue: queryParams.searchValue,
        isExpired: queryParams.isExpired,
        closeDateType: queryParams.closeDateType,
        startStartDate: queryParams.startStartDate,
        endStartDate: queryParams.endStartDate,
        startCloseDate: queryParams.startCloseDate,
        contractTypeId: queryParams.contractTypeId,
        endCloseDate: queryParams.endCloseDate,
        customerId: queryParams.customerId,
        branchId: queryParams.branchId,

        savingAmount: !!queryParams.savingAmount
          ? parseFloat(queryParams.savingAmount)
          : undefined,
        interestRate: !!queryParams.interestRate
          ? parseFloat(queryParams.interestRate)
          : undefined,
        tenor: !!queryParams.tenor ? parseInt(queryParams.tenor) : undefined,

        sortField: queryParams.sortField,
        sortDirection: queryParams.sortDirection
          ? parseInt(queryParams.sortDirection, 10)
          : undefined,
      },
      fetchPolicy: 'network-only',
    },
  );

  const savingsContractsAlertQuery = useQuery(
    gql(queries.savingsContractsAlert),
    {
      variables: {
        date: new Date(),
      },
      fetchPolicy: 'network-only',
    },
  );

  const [contractsRemove] = useMutation<RemoveMutationResponse>(
    gql(mutations.contractsRemove),
    {
      refetchQueries: ['contractsMain'],
    },
  );

  const onSearch = (searchValue: string) => {
    if (!searchValue) {
      return router.removeParams(history, 'searchValue');
    }

    router.setParams(history, { searchValue });
  };

  const onSelect = (values: string[] | string, key: string) => {
    const params = generateQueryParams(history);

    if (params[key] === values) {
      return router.removeParams(history, key);
    }

    return router.setParams(history, { [key]: values });
  };

  const isFiltered = (): boolean => {
    const params = generateQueryParams(history);

    for (const param in params) {
      if (FILTER_PARAMS_CONTRACT.includes(param)) {
        return true;
      }
    }

    return false;
  };

  const clearFilter = () => {
    const params = generateQueryParams(history);
    router.removeParams(history, ...Object.keys(params));
  };

  const removeContracts = ({ contractIds }, emptyBulk) => {
    contractsRemove({
      variables: { contractIds },
    })
      .then(() => {
        emptyBulk();
        Alert.success('You successfully deleted a contract');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const searchValue = queryParams.searchValue || '';
  const { list = [], totalCount = 0 } =
    contractsMainQuery?.data?.savingsContractsMain || {};
  const alerts: SavingAlert[] =
    savingsContractsAlertQuery?.data?.savingsContractsAlert || [];

  const updatedProps = {
    ...props,
    totalCount,
    searchValue,
    contracts: list,
    alerts,
    loading: contractsMainQuery.loading || loading,
    queryParams: queryParams,
    removeContracts,
    onSelect: onSelect,
    onSearch: onSearch,
    isFiltered: isFiltered(),
    clearFilter: clearFilter,
  };

  const contractsList = (props) => {
    return <ContractList {...updatedProps} {...props} />;
  };

  const refetch = () => {
    contractsMainQuery.refetch();
  };

  return <Bulk content={contractsList} refetch={refetch} />;
};

export default ContractListContainer;
