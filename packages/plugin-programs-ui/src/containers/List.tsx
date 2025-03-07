import { gql, useQuery } from "@apollo/client";
import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { Alert } from "@erxes/ui/src/utils";
import React from "react";
import List from "../components/List";
import { mutations, queries } from "../graphql";
import { ProgramQueryResponse, TypeQueryResponse } from "../types";

type Props = {
  queryParams: any;
};

const ListContainer = (props: Props) => {
  const listQuery = useQuery<ProgramQueryResponse>(gql(queries.list), {
    variables: {},
  });

  const typesQuery = useQuery<TypeQueryResponse>(
    gql(queries.listProgramTypes),
    {
      variables: {},
    }
  );

  const renderButton = ({
    passedName,
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.edit : mutations.add}
        variables={values}
        callback={callback}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? "updated" : "added"
        } a ${passedName}`}
        refetchQueries={["listQuery"]}
      />
    );
  };

  const remove = (program) => {
    Alert.success("Successfully deleted an item");
  };

  const edit = (program) => {
    Alert.success("Successfully updated an item");
  };

  const updatedProps = {
    ...props,
    programs: listQuery.data?.programs || [],
    loading: listQuery.loading,
    remove,
    edit,
    renderButton,
    types: typesQuery?.data?.programTypes || [],
  };
  return <List {...updatedProps} />;
};

export default ListContainer;
