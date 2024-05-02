import { gql } from "@apollo/client";
import * as compose from "lodash.flowright";
import { Alert, withProps } from "modules/common/utils";
import React from "react";
import { graphql } from "@apollo/client/react/hoc";
import { IRouterProps } from "@erxes/ui/src/types";
import ResetPassword from "../components/ResetPassword";
import { mutations } from "../graphql";
import {
  ResetPasswordMutationResponse,
  ResetPasswordMutationVariables,
} from "../types";
import withCurrentOrganization from "@erxes/ui-settings/src/general/saas/containers/withCurrentOrganization";
import { useNavigate } from "react-router-dom";

type Props = {
  token: string;
  currentOrganization: any;
};

export type FinalProps = ResetPasswordMutationResponse & Props & IRouterProps;

const ResetPasswordContainer = (props: FinalProps) => {
  const { resetPasswordMutation, token } = props;
  const navigate = useNavigate();

  const resetPassword = (newPassword) => {
    resetPasswordMutation({
      variables: {
        newPassword,
        token,
      },
    })
      .then(() => {
        navigate("/sign-in");
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
  )(withCurrentOrganization(ResetPasswordContainer))
);
