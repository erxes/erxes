import * as compose from "lodash.flowright";

import {
  ResetPasswordMutationResponse,
  ResetPasswordMutationVariables,
} from "../types";

import Alert from "../../utils/Alert";
import React from "react";
import ResetPassword from "../components/ResetPassword";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { mutations } from "../graphql";
import { useRouter } from "next/router";
import { withProps } from "../../utils";

type Props = {
  token: string;
};

export type FinalProps = ResetPasswordMutationResponse & Props;

const ResetPasswordContainer = (props: FinalProps) => {
  const router = useRouter();
  const { resetPasswordMutation, token } = props;

  const resetPassword = (newPassword) => {
    resetPasswordMutation({
      variables: {
        newPassword,
        token,
      },
    })
      .then(() => {
        router.push("/sign-in");
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
  )(ResetPasswordContainer)
);
