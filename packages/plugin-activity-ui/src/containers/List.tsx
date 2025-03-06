import { gql, useQuery } from "@apollo/client";
import * as compose from "lodash.flowright";
import { graphql } from "@apollo/client/react/hoc";
import { Alert, confirm, router, withProps } from "@erxes/ui/src/utils";
import List from "../components/List";
import {
  EditMutationResponse,
  RemoveMutationResponse,
  ActivityQueryResponse,
  TypeQueryResponse,
} from "../types";
import { mutations, queries } from "../graphql";
import React from "react";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import Spinner from "@erxes/ui/src/components/Spinner";

type Props = {
  queryParams: any;
};

const ListContainer = (props: Props) => {
  const listQuery = useQuery<ActivityQueryResponse>(gql(queries.list), {
    variables: {},
  });

  const typesQuery = useQuery<TypeQueryResponse>(
    gql(queries.listActivityTypes),
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

  const remove = (activity) => {
    Alert.success("Successfully deleted an item");
  };

  const edit = (activity) => {
    Alert.success("Successfully updated an item");
  };

  const updatedProps = {
    ...props,
    activities: listQuery.data?.activities || [],
    loading: listQuery.loading,
    remove,
    edit,
    renderButton,
    types: typesQuery?.data?.activityTypes || [],
  };
  return <List {...updatedProps} />;
};

export default ListContainer;
