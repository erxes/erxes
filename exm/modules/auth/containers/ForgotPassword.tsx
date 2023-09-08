import * as compose from "lodash.flowright";

import {
  ForgotPasswordMutationResponse,
  ForgotPasswordMutationVariables,
} from "../types";

import Alert from "../../utils/Alert";
import ForgotPassword from "../components/ForgotPassword";
import React from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { mutations } from "../graphql";

type Props = {};

type FinalProps = Props & ForgotPasswordMutationResponse;

const ForgotPasswordContainer = (props: FinalProps) => {
  const { forgotPasswordMutation } = props;

  const forgotPassword = (variables) => {
    forgotPasswordMutation({ variables })
      .then(() => {
        Alert.success(
          "Further instructions have been sent to your e-mail address."
        );
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    forgotPassword,
  };

  return <ForgotPassword {...updatedProps} />;
};

export default compose(
  graphql<
    Props,
    ForgotPasswordMutationResponse,
    ForgotPasswordMutationVariables
  >(gql(mutations.forgotPassword), {
    name: "forgotPasswordMutation",
  })
)(ForgotPasswordContainer);
