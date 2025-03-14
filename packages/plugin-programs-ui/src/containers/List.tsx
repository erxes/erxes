import { gql, useMutation, useQuery } from "@apollo/client";
import { Alert, Bulk, router } from "@erxes/ui/src";
import React from "react";
import { useNavigate } from "react-router-dom";
import ProgramsList from "../components/program/ProgramsList";
import { mutations, queries } from "../graphql";
import { ProgramQueryResponse, RemoveMutationResponse } from "../types";

type Props = {
  queryParams: any;
};

const ListContainer = (props: Props) => {
  const navigate = useNavigate();
  const { queryParams } = props;

  const programsQuery = useQuery<ProgramQueryResponse>(gql(queries.programs), {
    variables: {
      ...router.generatePaginationParams(queryParams || {}),
      ids: queryParams.ids,
      categoryId: queryParams.categoryId,
      searchValue: queryParams.searchValue,
      sortField: queryParams.sortField,
      sortDirection: queryParams.sortDirection,
    },
  });

  const [programsRemove] = useMutation<RemoveMutationResponse>(
    gql(mutations.programsRemove),
    generateOptions()
  );

  const removeCars = ({ programIds }, emptyBulk) => {
    programsRemove({
      variables: { programIds },
    })
      .then(() => {
        emptyBulk();
        Alert.success("You successfully deleted a programs");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const carsList = (bulkProps) => {
    const searchValue = queryParams.searchValue || "";
    const { list = [], totalCount = 0 } = programsQuery?.data?.programs || {};

    const updatedProps = {
      ...props,
      totalCount,
      searchValue,
      programs: list,
      loading: programsQuery.loading,
      remove: removeCars,
    };

    return <ProgramsList {...updatedProps} {...bulkProps} />;
  };

  const refetch = () => {
    programsQuery.refetch();
  };

  return <Bulk content={carsList} refetch={refetch} />;
};

export default ListContainer;

const generateOptions = () => ({
  refetchQueries: [
    "programs",
    "programCategories",
    "programCategoriesTotalCount",
  ],
});
