import * as compose from "lodash.flowright";

import { Alert, confirm, withProps } from "@erxes/ui/src/utils";
import { mutations, queries } from "../graphql";

import ActionSection from "../components/detail/ActionSection";
import { IUser } from "@erxes/ui/src/auth/types";
import React from "react";
import client from "@erxes/ui/src/apolloClient";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";

type Props = {
  user: IUser;
  isSmall?: boolean;
  renderEditForm: ({
    closeModal,
    user,
  }: {
    closeModal: () => void;
    user: IUser;
  }) => React.ReactNode;
};

type FinalProps = Props & { statusChangedMutation: any };

const ActionSectionContainer = (props: FinalProps) => {
  const { user, renderEditForm, isSmall } = props;

  const changeStatus = (id: string): void => {
    const { statusChangedMutation } = props;

    confirm().then(() => {
      statusChangedMutation({
        variables: { _id: id },
      })
        .then(() => {
          Alert.success("Congrats, Successfully updated.");
        })
        .catch((error: Error) => {
          Alert.error(error.message);
        });
    });
  };

  const resendInvitation = (email: string) => {
    confirm().then(() => {
      client
        .mutate({
          mutation: gql(mutations.usersResendInvitation),
          variables: { email },
        })
        .then(() => {
          Alert.success("Successfully resent the invitation");
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const updatedProps = {
    user,
    isSmall,
    renderEditForm,
    changeStatus,
    resendInvitation,
  };

  return <ActionSection {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }>(gql(mutations.usersSetActiveStatus), {
      name: "statusChangedMutation",
      options: ({ queryParams }) => ({
        refetchQueries: [
          {
            query: gql(queries.users),
          },
        ],
      }),
    })
  )(ActionSectionContainer)
);
