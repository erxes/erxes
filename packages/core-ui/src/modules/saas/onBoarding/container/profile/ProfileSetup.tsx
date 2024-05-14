import * as compose from "lodash.flowright";

import { Alert, router } from "modules/common/utils";
import { IUser, IUserDoc } from "@erxes/ui/src/auth/types";
import { mutations, queries } from "modules/saas/onBoarding/graphql";
import { useLocation, useNavigate } from "react-router-dom";

import { EditMutationResponse } from "modules/saas/onBoarding/types";
import Profile from "modules/saas/onBoarding/components/profile/Profile";
import React from "react";
import { UserDetailQueryResponse } from "@erxes/ui/src/team/types";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";

type Props = {
  currentUser: IUser;
  firstName: string;
  setFirstName: (name: string) => void;
  lastName: string;
  setLastName: (name: string) => void;
  email: string;
  setEmail: (name: string) => void;
  avatar: string;
  setAvatar: (name: string) => void;
};

type FinalProps = {
  userDetailQuery: UserDetailQueryResponse;
} & Props &
  EditMutationResponse;

function ProfileContainer(props: FinalProps) {
  const { usersEdit, currentUser, userDetailQuery } = props;

  const navigate = useNavigate();
  const location = useLocation();

  if (userDetailQuery.loading) {
    return null;
  }

  const userEdit = (_id: string, doc: IUserDoc) => {
    if (!doc.details?.firstName || !doc.details?.lastName) {
      Alert.error("FirstName and LastName can not be empty");
    }

    if (doc.details?.firstName && doc.details?.lastName) {
      usersEdit({
        variables: { _id, ...doc },
      })
        .then(() => {
          router.setParams(navigate, location, { steps: 2 });
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    }
  };

  const updatedProps = {
    ...props,
    userEdit,
    currentUser,
    user: userDetailQuery.userDetail || ({} as IUser),
  };

  return <Profile {...updatedProps} />;
}

export default compose(
  graphql<Props, UserDetailQueryResponse, {}>(gql(queries.userDetail), {
    name: "userDetailQuery",
    options: ({ currentUser }) => ({
      variables: { _id: currentUser._id },
    }),
  }),

  graphql<Props, EditMutationResponse, IUser>(gql(mutations.usersEdit), {
    name: "usersEdit",
  })
)(ProfileContainer);
