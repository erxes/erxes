import { Alert } from "@erxes/ui/src";
import { IUser } from "@erxes/ui/src/auth/types";
import { gql } from "@apollo/client";
import React from "react";
import { useNavigate } from "react-router-dom";
import withCurrentUser from "@erxes/ui/src/auth/containers/withCurrentUser";

import {
  ClientPortalUserRemoveMutationResponse,
  IClientPortalUser,
} from "../../types";
import { useMutation } from "@apollo/client";

import BasicInfoSection from "../../components/detail/BasicInfoSection";
import { mutations } from "../../graphql";

type Props = {
  clientPortalUser: IClientPortalUser;
};

type FinalProps = { currentUser: IUser } & Props &
  ClientPortalUserRemoveMutationResponse;

const BasicInfoContainer = (props: FinalProps) => {
  const { clientPortalUser } = props;
  const navigate = useNavigate();

  const [clientPortalUsersRemove] =
    useMutation<ClientPortalUserRemoveMutationResponse>(
      gql(mutations.clientPortalUsersRemove),
      {
        refetchQueries: ["clientPortalUserCounts", "clientPortalUsers"],
      }
    );

  const { _id } = clientPortalUser;

  const remove = () => {
    clientPortalUsersRemove({ variables: { clientPortalUserIds: [_id] } })
      .then(() => {
        Alert.success("You successfully deleted a client portal user");
        navigate("/settings/client-portal/user");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    remove,
  };

  return <BasicInfoSection {...updatedProps} />;
};

export default withCurrentUser(BasicInfoContainer);
