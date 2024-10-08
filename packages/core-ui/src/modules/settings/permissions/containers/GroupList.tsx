import {
  UsersGroupsAddMutation,
  UsersGroupsCopyMutation,
  UsersGroupsEditMutation,
  UsersGroupsRemoveMutation,
  UsersGroupsTotalCountQueryResponse,
} from "../types";
import { mutations, queries } from "../graphql";

import GroupList from "../components/GroupList";
import { UsersGroupsQueryResponse } from "@erxes/ui-settings/src/permissions/types";
import { commonListComposer } from "@erxes/ui/src/utils";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";

type Props = {
  queryParams: Record<string, string>;
};

const commonOptions = () => ({
  refetchQueries: [{ query: gql(queries.usersGroups) }],
});

export default commonListComposer<Props>({
  label: "usersGroups",
  text: "user group",
  stringEditMutation: mutations.usersGroupsEdit,
  stringAddMutation: mutations.usersGroupsAdd,
  stringCopyMutation: mutations.usersGroupsCopy,
  confirmProps: { options: { hasDeleteConfirm: true } },

  gqlListQuery: graphql<Props, UsersGroupsQueryResponse>(
    gql(queries.usersGroups),
    {
      name: "listQuery",
      options: ({ queryParams }) => {
        return {
          notifyOnNetworkStatusChange: true,
          variables: {
            perPage: queryParams.limit ? parseInt(queryParams.limit, 10) : 20,
          },
        };
      },
    }
  ),

  gqlTotalCountQuery: graphql<{}, UsersGroupsTotalCountQueryResponse>(
    gql(queries.userTotalCount),
    {
      name: "totalCountQuery",
    }
  ),

  gqlAddMutation: graphql<{}, UsersGroupsAddMutation>(
    gql(mutations.usersGroupsAdd),
    {
      name: "addMutation",
      options: commonOptions(),
    }
  ),

  gqlEditMutation: graphql<{}, UsersGroupsEditMutation>(
    gql(mutations.usersGroupsEdit),
    {
      name: "editMutation",
      options: commonOptions(),
    }
  ),

  gqlRemoveMutation: graphql<{}, UsersGroupsRemoveMutation>(
    gql(mutations.usersGroupsRemove),
    {
      name: "removeMutation",
      options: commonOptions(),
    }
  ),

  gqlCopyMutation: graphql<{}, UsersGroupsCopyMutation>(
    gql(mutations.usersGroupsCopy),
    {
      name: "copyMutation",
      options: commonOptions(),
    }
  ),

  ListComponent: GroupList,
});
