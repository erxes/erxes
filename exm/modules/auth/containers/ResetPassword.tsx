import * as compose from "lodash.flowright";

import {
  ResetPasswordMutationResponse,
  ResetPasswordMutationVariables,
} from "../types";

import Alert from "../../utils/Alert";
import { IRouterProps } from "../../types";
import React from "react";
import ResetPassword from "../components/ResetPassword";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { mutations } from "../graphql";
import { withProps } from "../../utils";
import { withRouter } from "react-router-dom";

type Props = {
  token: string;
};

export type FinalProps = ResetPasswordMutationResponse & Props & IRouterProps;

const ResetPasswordContainer = (props: FinalProps) => {
  const { resetPasswordMutation, history, token } = props;

  const resetPassword = (newPassword) => {
    resetPasswordMutation({
      variables: {
        newPassword,
        token,
      },
    })
      .then(() => {
        history.push("/sign-in");
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    resetPassword,
  };

  return <ResetPassword {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<
      Props,
      ResetPasswordMutationResponse,
      ResetPasswordMutationVariables
    >(gql(mutations.resetPassword), {
      name: "resetPasswordMutation",
    })
  )(withRouter<FinalProps>(ResetPasswordContainer))
);
