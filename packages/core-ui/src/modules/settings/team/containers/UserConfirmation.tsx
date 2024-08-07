import * as compose from "lodash.flowright";

import { Alert, withProps } from "@erxes/ui/src/utils";
import {
  ConfirmMutationResponse,
  ConfirmMutationVariables,
} from "@erxes/ui/src/team/types";

import { IUser } from "@erxes/ui/src/auth/types";
import React from "react";
import UserConfirmation from "../components/UserConfirmation";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { mutations } from "@erxes/ui/src/team/graphql";
import { useNavigate } from "react-router-dom";

type Props = {
  queryParams: Record<string, string>;
  currentUser?: IUser;
};

type FinalProps = Props & ConfirmMutationResponse;

const UserConfirmationContainer = (props: FinalProps) => {
  const { usersConfirmInvitation, queryParams, currentUser } = props;
  const navigate = useNavigate();

  const confirmUser = ({
    password,
    passwordConfirmation,
    username,
    fullName,
  }: {
    password: string;
    passwordConfirmation: string;
    username: string;
    fullName: string;
  }) => {
    usersConfirmInvitation({
      variables: {
        token: queryParams.token,
        password,
        passwordConfirmation,
        username,
        fullName,
      },
    })
      .then(() => {
        Alert.success("You successfully verified");
        navigate("/");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    confirmUser,
    currentUser,
  };

  return <UserConfirmation {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ConfirmMutationResponse, ConfirmMutationVariables>(
      gql(mutations.usersConfirmInvitation),
      {
        name: "usersConfirmInvitation",
        options: {
          refetchQueries: ["users"],
        },
      }
    )
  )(UserConfirmationContainer)
);
