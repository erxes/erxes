import { gql, useMutation, useQuery } from "@apollo/client";
import { Bulk, Spinner } from "@erxes/ui/src/components";
import { IQueryParams } from "@erxes/ui/src/types";
import { Alert, router } from '@erxes/ui/src/utils';
import queryString from "query-string";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PutResponse from "../components/PutResponses";
import { FILTER_PARAMS } from "../constants";
import { mutations, queries } from "../graphql";
import {
  PutResponseReReturnMutationResponse,
  PutResponsesAmountQueryResponse,
  PutResponsesCountQueryResponse,
  PutResponsesQueryResponse,
} from "../types";

type Props = {
  queryParams: any;
};

const generateQueryParams = (location) => {
  return queryString.parse(location.search);
};

const PutResponsesContainer: React.FC<Props> = (props) => {
  const { queryParams } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const putResponsesQuery = useQuery<PutResponsesQueryResponse>(
    gql(queries.putResponses),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: "network-only",
    }
  );
  const putResponsesCountQuery = useQuery<PutResponsesCountQueryResponse>(
    gql(queries.putResponsesCount),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: "network-only",
    }
  );
  const putResponsesAmountQuery = useQuery<PutResponsesAmountQueryResponse>(
    gql(queries.putResponsesAmount),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: "network-only",
    }
  );

  const [reReturn] = useMutation<PutResponseReReturnMutationResponse>(
    gql(mutations.putResponseReReturn),
  );

  const onReReturn = (_id) => {
    reReturn({
      variables: {
        _id
      }
    }).then(() => {
      Alert.success('Articles assigned successfully');
      putResponsesQuery.refetch()
    }).catch((e) => {
      Alert.error(e.message);
    });
  }

  const onSearch = (search: string, key?: string) => {
    router.removeParams(navigate, location, "page");

    if (!search) {
      return router.removeParams(navigate, location, key || "search");
    }

    router.setParams(navigate, location, { [key || "search"]: search });
  };

  const onSelect = (values: string[] | string, key: string) => {
    const params = generateQueryParams(location);
    router.removeParams(navigate, location, "page");

    if (params[key] === values) {
      return router.removeParams(navigate, location, key);
    }

    return router.setParams(navigate, location, { [key]: values });
  };

  const onFilter = (filterParams: IQueryParams) => {
    router.setParams(navigate, location, filterParams);

    return router;
  };

  const isFiltered = (): boolean => {
    const params = generateQueryParams(location);

    for (const param in params) {
      if (FILTER_PARAMS.includes(param)) {
        return true;
      }
    }

    return false;
  };

  const clearFilter = () => {
    const params = generateQueryParams(location);
    router.removeParams(navigate, location, ...Object.keys(params));
  };

  if (
    putResponsesQuery.loading ||
    putResponsesCountQuery.loading ||
    putResponsesAmountQuery.loading
  ) {
    return <Spinner />;
  }

  const searchValue = queryParams.searchValue || "";
  const putResponses =
    (putResponsesQuery.data && putResponsesQuery.data.putResponses) || [];
  const putResponsesCount =
    (putResponsesCountQuery.data &&
      putResponsesCountQuery.data.putResponsesCount) ||
    0;
  const putResponsesAmount =
    (putResponsesAmountQuery.data &&
      putResponsesAmountQuery.data.putResponsesAmount) ||
    0;

  const updatedProps = {
    ...props,

    searchValue,
    putResponses,
    totalCount: putResponsesCount,
    sumAmount: putResponsesAmount,
    loading: putResponsesQuery.loading,

    onFilter: onFilter,
    onSelect: onSelect,
    onSearch: onSearch,
    isFiltered: isFiltered(),
    clearFilter: clearFilter,
    onReReturn
  };

  const putResponsesList = (props) => {
    return <PutResponse {...updatedProps} {...props} />;
  };

  const refetch = () => {
    putResponsesQuery.refetch();
  };

  return <Bulk content={putResponsesList} refetch={refetch} />;
};

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  sortField: queryParams.sortField,
  sortDirection: queryParams.sortDirection
    ? parseInt(queryParams.sortDirection, 10)
    : undefined,
  search: queryParams.search,
  contentType: queryParams.contentType,
  success: queryParams.success,
  billType: queryParams.billType,
  billIdRule: queryParams.billIdRule,
  isLast: queryParams.isLast,
  orderNumber: queryParams.orderNumber,
  contractNumber: queryParams.contractNumber,
  transactionNumber: queryParams.transactionNumber,
  dealName: queryParams.dealName,
  pipelineId: queryParams.pipelineId,
  stageId: queryParams.stageId,
  createdStartDate: queryParams.createdStartDate,
  createdEndDate: queryParams.createdEndDate,
  paidDate: queryParams.paidDate,
});

export default PutResponsesContainer;
