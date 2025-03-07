import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import Spinner from "@erxes/ui/src/components/Spinner";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { Alert, confirm, withProps } from "@erxes/ui/src/utils";
import * as compose from "lodash.flowright";
import React from "react";
import SideBar from "../components/SideBar";
import { mutations, queries } from "../graphql";
import {
  EditTypeMutationResponse,
  RemoveTypeMutationResponse,
  TypeQueryResponse,
} from "../types";

type Props = {
  history: any;
  currentTypeId?: string;
};

type FinalProps = {
  listCurriculumTypeQuery: TypeQueryResponse;
} & Props &
  RemoveTypeMutationResponse &
  EditTypeMutationResponse;

const TypesListContainer = (props: FinalProps) => {
  const { listCurriculumTypeQuery, typesEdit, typesRemove, history } = props;

  if (listCurriculumTypeQuery.loading) {
    return <Spinner />;
  }

  // calls gql mutation for edit/add type
  const renderButton = ({
    passedName,
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.editType : mutations.addType}
        variables={values}
        callback={callback}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? "updated" : "added"
        } a ${passedName}`}
        refetchQueries={["listCurriculumTypeQuery"]}
      />
    );
  };

  const remove = (type) => {
    confirm("You are about to delete the item. Are you sure? ")
      .then(() => {
        typesRemove({ variables: { _id: type._id } })
          .then(() => {
            Alert.success("Successfully deleted an item");
          })
          .catch((e) => Alert.error(e.message));
      })
      .catch((e) => Alert.error(e.message));
  };

  const updatedProps = {
    ...props,
    types: listCurriculumTypeQuery.programTypes || [],
    loading: listCurriculumTypeQuery.loading,
    remove,
    renderButton,
  };

  return <SideBar {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(queries.listCurriculumTypes), {
      name: "listCurriculumTypeQuery",
      options: () => ({
        fetchPolicy: "network-only",
      }),
    }),
    graphql(gql(mutations.removeType), {
      name: "typesRemove",
      options: () => ({
        refetchQueries: ["listCurriculumTypeQuery"],
      }),
    })
  )(TypesListContainer)
);
