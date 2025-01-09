import { gql } from "@apollo/client";
import { router } from "@erxes/ui/src/utils/core";
import Alert from "@erxes/ui/src/utils/Alert";
import Bulk from "@erxes/ui/src/components/Bulk";
import React, { useEffect, useState } from "react";
import ContractList from "../components/list/ContractsList";
import { mutations, queries } from "../graphql";
import queryString from "query-string";
import { MainQueryResponse, RemoveMutationResponse } from "../types";
import { FILTER_PARAMS_CONTRACT } from "../../constants";
import { useMutation, useQuery } from "@apollo/client";
import { useLocation, useNavigate } from "react-router-dom";
import subscriptions from "../graphql/subscriptions";

type Props = {
  queryParams: any;
};

type ContractAlert = { name: string; count: number; filter: any };

const generateQueryParams = (location) => {
  return queryString.parse(location.search);
};

const ContractListContainer = (props: Props) => {
  const { queryParams } = props;
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

        leaseAmount: !!queryParams.leaseAmount
          ? parseFloat(queryParams.leaseAmount)
          : undefined,
        interestRate: !!queryParams.interestRate
          ? parseFloat(queryParams.interestRate)
          : undefined,
        tenor: !!queryParams.tenor ? parseInt(queryParams.tenor) : undefined,
        repayment: queryParams.repayment,

        repaymentDate: queryParams.repaymentDate,
        sortField: queryParams.sortField,
        sortDirection: queryParams.sortDirection
          ? parseInt(queryParams.sortDirection, 10)
          : undefined,
      },
      fetchPolicy: "network-only",
    }
  );

  const contractsAlertQuery = useQuery(gql(queries.contractsAlert), {
    variables: {
      date,
    },
    fetchPolicy: "network-only",
  });

  const [contractsRemove] = useMutation<RemoveMutationResponse>(
    gql(mutations.contractsRemove),
    {
      refetchQueries: ["contractsMain"],
    }
  );

  const onSearch = (searchValue: string) => {
    if (!searchValue) {
      return router.removeParams(navigate, location, "searchValue");
    }

    router.setParams(navigate, location, { searchValue });
  };

  const onSelect = (values: string[] | string, key: string) => {
    const params = generateQueryParams(location);

    if (params[key] === values) {
      return router.removeParams(navigate, location, key);
    }

    return router.setParams(navigate, location, { [key]: values });
  };

  const isFiltered = (): boolean => {
    const params = generateQueryParams(location);

    for (const param in params) {
      if (FILTER_PARAMS_CONTRACT.includes(param)) {
        return true;
      }
    }

    return false;
  };

  const clearFilter = () => {
    const params = generateQueryParams(location);
    router.removeParams(navigate, location, ...Object.keys(params));
  };

  const removeContracts = ({ contractIds }, emptyBulk) => {
    contractsRemove({
      variables: { contractIds },
    })
      .then(() => {
        emptyBulk();
        Alert.success("You successfully deleted a contract");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const searchValue = queryParams.searchValue || "";
  const { list = [], totalCount = 0 } =
    contractsMainQuery?.data?.contractsMain || {};

  useEffect(() => {
    return contractsMainQuery.subscribeToMore({
      document: gql(subscriptions.loansContractChanged),
      variables: { ids: list.map(l => l._id) },
      updateQuery: (prev) => {
        contractsMainQuery.refetch();
        return prev
      }
    });
  });

  const alerts =
    contractsAlertQuery?.data?.contractsAlert || ([] as ContractAlert[]);

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
    isFiltered: isFiltered,
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
