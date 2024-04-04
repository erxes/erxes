import { Alert } from "../../utils";
import EditForm from "../components/EditForm";
import { IExm } from "../../types";
import React from "react";
import gql from "graphql-tag";
import { mutations } from "../graphql";
import { useMutation } from "@apollo/client";

type Props = {
  exm: IExm;
};

function EditFormContainer(props: Props) {
  const [editMutation] = useMutation(gql(mutations.exmsEdit));

  const edit = (variables: IExm) => {
    editMutation({ variables })
      .then(() => {
        Alert.success("Successfully edited");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  return <EditForm edit={edit} exm={props.exm} />;
}

export default EditFormContainer;
