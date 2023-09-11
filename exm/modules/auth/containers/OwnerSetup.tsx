import * as compose from "lodash.flowright";

import { CreateOwnerMutationResponse, IOwner } from "../types";

import Alert from "../../utils/Alert";
import OwnerSetup from "../components/OwnerSetup";
import React from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { mutations } from "../graphql";

type Props = {};

type FinalProps = Props & CreateOwnerMutationResponse;

const OwnerSetupContainer = (props: FinalProps) => {
  const { createOwnerMutation } = props;

  const createOwner = (doc: IOwner) => {
    createOwnerMutation({
      variables: doc,
    })
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  return <OwnerSetup createOwner={createOwner} />;
};

export default compose(
  graphql<Props, CreateOwnerMutationResponse, IOwner>(
    gql(mutations.createOwner),
    {
      name: "createOwnerMutation",
    }
  )
)(OwnerSetupContainer);
