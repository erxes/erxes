import { Alert, Bulk, Spinner, confirm, router } from "@erxes/ui/src";
import {
  CoversCountQueryResponse,
  CoversQueryResponse,
  RemoveCoverMutationResponse,
} from "../types";
import { mutations, queries } from "../graphql";

import { FILTER_PARAMS } from "../../constants";
import { IQueryParams } from "@erxes/ui/src/types";
import List from "../components/CoverList";
import React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
};

const CoverListContainer = (props: Props) => {
  const { queryParams } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const coversQuery = useQuery<CoversQueryResponse>(gql(queries.covers), {
    variables: generateParams({ queryParams } || {}),
    fetchPolicy: "network-only",
  });

  const coversCountQuery = useQuery<CoversCountQueryResponse>(
    gql(queries.coversCount),
    {
      variables: generateParams({ queryParams } || {}),
      fetchPolicy: "network-only",
    }
  );

  const [removeCover] = useMutation<RemoveCoverMutationResponse>(
    gql(mutations.coversRemove)
  );

  if (coversQuery.loading || coversCountQuery.loading) {
    return <Spinner />;
  }

  const onSearch = (search: string) => {
    router.removeParams(navigate, location, "page");

    if (!search) {
      return router.removeParams(navigate, location, "search");
    }

    router.setParams(navigate, location, { search });
  };

  const onSelect = (values: string[] | string, key: string) => {
    router.removeParams(navigate, location, "page");

    if (queryParams.params[key] === values) {
      return router.removeParams(navigate, location, key);
    }

    return router.setParams(navigate, location, { [key]: values });
  };

  const onFilter = (filterParams: IQueryParams) => {
    router.removeParams(navigate, location, "page");

    for (const key of Object.keys(filterParams)) {
      if (filterParams[key]) {
        router.setParams(navigate, location, { [key]: filterParams[key] });
      } else {
        router.removeParams(navigate, location, key);
      }
    }

    return router;
  };

  const isFiltered = (): boolean => {
    for (const param in queryParams) {
      if (FILTER_PARAMS.includes(param)) {
        return true;
      }
    }

    return false;
  };

  const clearFilter = () => {
    router.removeParams(navigate, location, ...Object.keys(queryParams));
  };

  const remove = (_id: string) => {
    const message = "Are you sure?";

    confirm(message).then(() => {
      removeCover({
        variables: { _id },
      })
        .then(() => {
          // refresh queries
          coversQuery.refetch();

          Alert.success("You successfully deleted a pos.");
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const ordersList = (bulkProps) => {
    const covers = coversQuery?.data?.posCovers || [];
    const coversCount = coversCountQuery?.data?.posCoversCount || 0;
    const loading = coversQuery.loading || coversCountQuery.loading;

    const updatedProps = {
      ...props,
      covers,
      onFilter,
      onSelect,
      onSearch,
      isFiltered: isFiltered(),
      clearFilter,
      remove,
      coversCount,
      loading,
    };

    return <List {...updatedProps} {...bulkProps} />;
  };

  const refetch = () => {
    coversQuery.refetch();
  };

  return <Bulk content={ordersList} refetch={refetch} />;
};

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  sortField: queryParams.sortField,
  sortDirection: queryParams.sortDirection
    ? parseInt(queryParams.sortDirection, 10)
    : undefined,
  startDate: queryParams.startDate,
  endDate: queryParams.endDate,
  userId: queryParams.userId,
  posId: queryParams.posId,
  posToken: queryParams.posToken,
});

export default CoverListContainer;
