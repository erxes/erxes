import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import { queries as userQueries } from 'modules/settings/team/graphql';
import { UsersQueryResponse } from 'modules/settings/team/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import GroupList from '../components/GroupList';
import { mutations, queries } from '../graphql';
import {
  UsersGroupsAddMutation,
  UsersGroupsEditMutation,
  UsersGroupsQueryResponse,
  UsersGroupsRemoveMutation,
  UsersGroupsTotalCountQueryResponse
} from '../types';

type Props = {
  queryParams: any;
  users: IUser[];
};

const commonOptions = () => ({
  refetchQueries: [{ query: gql(queries.usersGroups) }]
});

const MainGroupList = commonListComposer<Props>({
  label: 'usersGroups',
  text: 'user group',
  stringEditMutation: mutations.usersGroupsEdit,
  stringAddMutation: mutations.usersGroupsAdd,

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

  ListComponent: GroupList
});

type FinalProps = {
  usersQuery: UsersQueryResponse;
} & Props;

class GroupListWithUsers extends React.Component<FinalProps> {
  render() {
    const { usersQuery } = this.props;
    const users = usersQuery.users;

    const updatedProps = {
      ...this.props,
      users
    };

    return <MainGroupList {...updatedProps} />;
  }
}

export default compose(
  graphql<Props, UsersQueryResponse>(gql(userQueries.users), {
    name: 'usersQuery'
  })
)(GroupListWithUsers);
