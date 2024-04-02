import { Alert, Bulk, router } from "@erxes/ui/src";
import { gql } from "@apollo/client";
import queryString from "query-string";
import React, { useState } from "react";

import { FILTER_PARAMS_TR } from "../../constants";
import TransactionList from "../components/TransactionList";
import { mutations, queries } from "../graphql";
import { MainQueryResponse, RemoveMutationResponse } from "../types";
import { useQuery, useMutation } from "@apollo/client";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
};

const generateQueryParams = (location) => {
  return queryString.parse(location.search);
};

const TransactionListContainer: React.FC<Props> = (props) => {
  const { queryParams } = props;
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const transactionsMainQuery = useQuery<MainQueryResponse>(
    gql(queries.transactionsMain),
    {
      variables: {
        ...router.generatePaginationParams(queryParams || {}),
        contractId: queryParams.contractId,
        customerId: queryParams.customerId,
        companyId: queryParams.companyId,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
        searchValue: queryParams.search,
        payDate: queryParams.payDate,
        contractHasnt: queryParams.contractHasnt,
        ids: queryParams.ids,
        sortField: queryParams.sortField,
        sortDirection: queryParams.sortDirection
          ? parseInt(queryParams.sortDirection, 10)
          : undefined,
      },
    }
  );
  const [transactionsRemove] = useMutation<RemoveMutationResponse>(
    gql(mutations.transactionsRemove),
    { refetchQueries: ["transactionsMain"] }
  );

  const onSearch = (search: string) => {
    if (!search) {
      return router.removeParams(navigate, location, "search");
    }

    router.setParams(navigate, location, { search });
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
      if (FILTER_PARAMS_TR.includes(param)) {
        return true;
      }
    }

    return false;
  };

  const clearFilter = () => {
    const params = generateQueryParams(location);
    router.removeParams(navigate, location, ...Object.keys(params));
  };

  const removeTransactions = ({ transactionIds }, emptyBulk) => {
    transactionsRemove({
      variables: { transactionIds },
    })
      .then(() => {
        emptyBulk();
        Alert.success("You successfully deleted a transaction");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const { list = [], totalCount = 0 } =
    transactionsMainQuery?.data?.savingsTransactionsMain || {};

  const updatedProps = {
    ...props,
    totalCount,
    transactions: list,
    loading: transactionsMainQuery.loading || loading,
    removeTransactions,
    onSelect: onSelect,
    onSearch: onSearch,
    isFiltered: isFiltered(),
    clearFilter: clearFilter,
  };

  const transactionsList = (props) => {
    return <TransactionList {...updatedProps} {...props} />;
  };

  const refetch = () => {
    transactionsMainQuery.refetch();
  };

  return <Bulk content={transactionsList} refetch={refetch} />;
};

export default TransactionListContainer;
