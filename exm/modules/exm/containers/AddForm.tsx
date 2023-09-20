import AddForm from "../components/AddForm";
import { Alert } from "../../utils";
import React from "react";
import gql from "graphql-tag";
import { mutations } from "../graphql";
import { useMutation } from "@apollo/client";

function AddFormContainer() {
  const [addMutation] = useMutation(gql(mutations.exmsAdd));

  const add = (variables: { name: string }) => {
    addMutation({ variables })
      .then(() => {
        Alert.success("Successfully added");

        window.location.reload();
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  return <AddForm add={add} />;
}

export default AddFormContainer;
