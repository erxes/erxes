import React from "react";
import List from "../components/List";
import { gql } from "@apollo/client";
import { queries, mutations } from "../graphql";
import { Alert, Spinner, confirm } from "@erxes/ui/src";
import { generatePaginationParams } from "@erxes/ui/src/utils/router";
import { useQuery, useMutation } from "@apollo/client";

type Props = {
  queryParams: any;
  type?: string;
};

const ListContainer: React.FC<Props> = (props) => {
  const { queryParams } = props;

  const listQuery = useQuery(gql(queries.requests), {
    variables: {
      ...generateQueryParams(queryParams),
    },
  });

  const [removeRequests] = useMutation(gql(mutations.removeRequests), {
    refetchQueries: refetchQueries(queryParams),
  });

  if (listQuery.loading) {
    return <Spinner />;
  }

  const { grantRequests, grantRequestsTotalCount } = listQuery.data;

  const remove = (ids: string[]) => {
    confirm("this action will erase every data of Requests.Are you sure?").then(
      () => {
        removeRequests({ variables: { ids } })
          .then(() => {
            Alert.success("Removed successfully");
          })
          .catch((err) => {
            Alert.error(err.message);
          });
      }
    );
  };

  const updatedProps = {
    queryParams,
    list: grantRequests || [],
    totalCount: grantRequestsTotalCount,
    handleRemove: remove,
  };

  return <List {...updatedProps} />;
};

const generateQueryParams = (queryParams) => {
  return {
    status: queryParams.type,
    requesterId: queryParams.requesterId,
    userId: queryParams.recipientId,
    sortField: queryParams?.sortField,
    sortDirection: Number(queryParams?.sortDirection) || undefined,
    createdAtFrom: queryParams.createdAtFrom || undefined,
    createdAtTo: queryParams.createdAtTo || undefined,
    closedAtFrom: queryParams.closedAtFrom || undefined,
    closedAtTo: queryParams.closedAtTo || undefined,
    onlyWaitingMe: ["true"].includes(queryParams?.onlyWaitingMe),
    archived: queryParams?.archived === "true",
    ...generatePaginationParams(queryParams || {}),
  };
};

const refetchQueries = (queryParams) => {
  return [
    {
      query: gql(queries.requests),
      variables: { ...generateQueryParams(queryParams) },
    },
  ];
};

export default ListContainer;
