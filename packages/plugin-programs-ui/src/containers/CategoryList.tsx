import { gql, useMutation, useQuery } from "@apollo/client";
import { Alert } from "@erxes/ui/src/utils";
import React from "react";
import List from "../components/category/CategoryList";
import { mutations, queries } from "../graphql";
import {
  ProgramCategoriesCountQueryResponse,
  ProgramCategoriesQueryResponse,
  ProgramCategoryRemoveMutationResponse,
} from "../types";

type Props = { queryParams: any };
const CategoryListContainer = (props: Props) => {
  const programCategoriesQuery = useQuery<ProgramCategoriesQueryResponse>(
    gql(queries.programCategories),
    {
      fetchPolicy: "network-only",
    }
  );

  const programCategoriesCountQuery =
    useQuery<ProgramCategoriesCountQueryResponse>(
      gql(queries.programCategoriesCount)
    );

  const [programCategoryRemove] =
    useMutation<ProgramCategoryRemoveMutationResponse>(
      gql(mutations.programCategoryRemove),
      {
        refetchQueries: ["programCategories", "programCategoriesCount"],
      }
    );

  const remove = (programId) => {
    Alert.success(`You successfully deleted a program category`);
  };

  const programCategories =
    programCategoriesQuery?.data?.programCategories || [];
  const loading =
    programCategoriesQuery.loading || programCategoriesCountQuery.loading;
  const totalCount =
    programCategoriesCountQuery?.data?.programCategoriesTotalCount || 0;

  const updatedProps = {
    ...props,
    remove,
    refetch: programCategoriesQuery.refetch,
    programCategories,
    loading,
    totalCount,
  };

  return <List {...updatedProps} />;
};

export default CategoryListContainer;
