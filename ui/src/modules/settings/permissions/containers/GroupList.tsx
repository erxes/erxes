import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import GroupList from '../components/GroupList';
import { mutations, queries } from '../graphql';
import {
  UsersGroupsAddMutation,
  UsersGroupsCopyMutation,
  UsersGroupsEditMutation,
  UsersGroupsQueryResponse,
  UsersGroupsRemoveMutation,
  UsersGroupsTotalCountQueryResponse
} from '../types';

type Props = {
  queryParams: any;
};

const commonOptions = () => ({
  refetchQueries: [{ query: gql(queries.usersGroups) }]
});

export default commonListComposer<Props>({
  label: 'usersGroups',
  text: 'user group',
  stringEditMutation: mutations.usersGroupsEdit,
  stringAddMutation: mutations.usersGroupsAdd,
  stringCopyMutation: mutations.usersGroupsCopy,

  gqlListQuery: graphql<Props, UsersGroupsQueryResponse>(
    gql(queries.usersGroups),
    {
      name: 'listQuery',
      options: ({ queryParams }) => {
        return {
          notifyOnNetworkStatusChange: true,
          variables: {
            perPage: queryParams.limit ? parseInt(queryParams.limit, 10) : 20
          }
        };
      }
    }
  ),

  gqlTotalCountQuery: graphql<{}, UsersGroupsTotalCountQueryResponse>(
    gql(queries.userTotalCount),
    {
      name: 'totalCountQuery'
    }
  ),

  gqlAddMutation: graphql<{}, UsersGroupsAddMutation>(
    gql(mutations.usersGroupsAdd),
    {
      name: 'addMutation',
      options: commonOptions()
    }
  ),

  gqlEditMutation: graphql<{}, UsersGroupsEditMutation>(
    gql(mutations.usersGroupsEdit),
    {
      name: 'editMutation',
      options: commonOptions()
    }
  ),

  gqlRemoveMutation: graphql<{}, UsersGroupsRemoveMutation>(
    gql(mutations.usersGroupsRemove),
    {
      name: 'removeMutation',
      options: commonOptions()
    }
  ),

  gqlCopyMutation: graphql<{}, UsersGroupsCopyMutation>(
    gql(mutations.usersGroupsCopy), {
      name: 'copyMutation',
      options: commonOptions()
    }
  ),

  ListComponent: GroupList
});
