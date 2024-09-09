import {
  ICommonFormProps,
  ICommonListProps,
} from "@erxes/ui-settings/src/common/types";
import { mutations, queries } from "@erxes/ui/src/team/graphql";

import { Alert } from "@erxes/ui/src/utils";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import React from "react";
import UserList from "../components/UserList";
import client from "@erxes/ui/src/apolloClient";
import { commonListComposer } from "@erxes/ui/src/utils";
import { generatePaginationParams } from "@erxes/ui/src/utils/router";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";

type Props = ICommonListProps &
  ICommonFormProps & {
    statusChangedMutation: any;
    listQuery: any;
    totalCountQuery: any;
    renderButton: (props: IButtonMutateProps) => JSX.Element;
  };

class UserListContainer extends React.Component<Props> {
  changeStatus = (id: string): void => {
    const { statusChangedMutation, listQuery } = this.props;

    statusChangedMutation({
      variables: { _id: id },
    })
      .then(() => {
        listQuery.refetch();

        Alert.success("Congrats, Successfully updated.");
      })
      .catch((error: Error) => {
        Alert.error(error.message);
      });
  };

  resendInvitation(email: string) {
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
  }

  render() {
    const { renderButton } = this.props;

    return (
      <UserList
        {...this.props}
        changeStatus={this.changeStatus}
        resendInvitation={this.resendInvitation}
        renderButton={renderButton}
      />
    );
  }
}

export const options = ({
  queryParams,
}: {
  queryParams: Record<string, string>;
}): any => {
  return {
    variables: {
      ...generatePaginationParams(queryParams),
      searchValue: queryParams.searchValue,
      isActive: queryParams.isActive === "false" ? false : true,
      brandIds: queryParams.brandIds,
      departmentId: queryParams.departmentId,
      unitId: queryParams.unitId,
      branchId: queryParams.branchId,
      segment: queryParams.segment,
      segmentData: queryParams.segmentData,
    },
    fetchPolicy: "network-only",
  };
};

export default commonListComposer<{ queryParams: Record<string, string> }>({
  text: "team member",
  label: "users",
  stringAddMutation: mutations.usersInvite,
  stringEditMutation: mutations.usersEdit,
  confirmProps: { options: { hasDeleteConfirm: true } },

  gqlListQuery: graphql(gql(queries.users), {
    name: "listQuery",
    options,
  }),
  gqlAddMutation: graphql(gql(mutations.usersInvite), {
    name: "addMutation",
  }),
  gqlEditMutation: graphql(gql(mutations.usersEdit), {
    name: "editMutation",
  }),
  gqlRemoveMutation: graphql<{ queryParams: any }>(
    gql(mutations.usersSetActiveStatus),
    {
      name: "statusChangedMutation",
      options: ({ queryParams }) => ({
        refetchQueries: [
          {
            query: gql(queries.users),
            variables: {
              ...generatePaginationParams(queryParams),
              isActive: !(queryParams.isActive === "false" ? false : true),
            },
          },
        ],
      }),
    }
  ),
  gqlTotalCountQuery: graphql(gql(queries.usersTotalCount), {
    name: "totalCountQuery",
    options,
  }),
  ListComponent: UserListContainer,
});
