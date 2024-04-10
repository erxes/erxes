// erxes
import { Alert, confirm, router } from "@erxes/ui/src/utils";
import { mutations, queries } from "../graphql";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";

import Bulk from "@erxes/ui/src/components/Bulk";
import { ISafeRemainder } from "../types";
// local
import ListComponent from "../components/List";
import React from "react";
import { gql } from "@apollo/client";
import queryString from "query-string";

function ListContainer() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  // Queries
  const safeRemaindersQuery = useQuery(gql(queries.safeRemainders), {
    variables: {
      ...router.generatePaginationParams(queryParams || {}),
      beginDate: queryParams.beginDate,
      endDate: queryParams.endDate,
      productId: queryParams.productId,
      branchId: queryParams.branchId,
      departmentId: queryParams.departmentId,
      searchValue: queryParams.searchValue,
    },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  // Mutations
  const [safeRemainderRemove] = useMutation(
    gql(mutations.safeRemainderRemove),
    {
      refetchQueries: ["safeRemaindersQuery"],
    }
  );

  // Methods
  const refetch = () => safeRemaindersQuery.refetch();

  const handleSearch = (event: any) => {
    const searchValue = event.target.value;

    if (searchValue.length === 0) {
      return router.removeParams(navigate, location, "searchValue");
    }

    router.setParams(navigate, location, { searchValue });
  };

  const removeItem = (remainder: ISafeRemainder) => {
    confirm(`This action will remove the remainder. Are you sure?`)
      .then(() => {
        safeRemainderRemove({ variables: { _id: remainder._id } })
          .then(() => {
            Alert.success("You successfully deleted a census");
            safeRemaindersQuery.refetch();
          })
          .catch((e) => {
            Alert.error(e.message);
          });
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  // Definitions
  const remainders =
    (safeRemaindersQuery.data &&
      safeRemaindersQuery.data.safeRemainders.remainders) ||
    [];

  const totalCount =
    (safeRemaindersQuery.data &&
      safeRemaindersQuery.data.safeRemainders.totalCount) ||
    0;

  const searchValue = queryParams.searchValue || "";

  const componentProps = {
    remainders,
    totalCount,
    loading: safeRemaindersQuery.loading,
    handleSearch,
    searchValue,
    removeItem,
  };

  const renderContent = (bulkProps: any) => {
    return <ListComponent {...componentProps} {...bulkProps} />;
  };

  return <Bulk content={renderContent} refetch={refetch} />;
}

export default ListContainer;
