import gql from 'graphql-tag';
import { generatePaginationParams } from 'modules/common/utils/router';
import { graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import { UserList } from '../components';
import { mutations, queries } from '../graphql';

export default commonListComposer<{ queryParams: any; history: any }>({
  name: 'users',

  gqlListQuery: graphql(gql(queries.users), {
    name: 'listQuery',
    options: ({ queryParams }: { queryParams: any }) => ({
      notifyOnNetworkStatusChange: true,
      variables: generatePaginationParams(queryParams)
    })
  }),
  gqlTotalCountQuery: graphql(gql(queries.totalUsersCount), {
    name: 'totalCountQuery'
  }),
  gqlAddMutation: graphql(gql(mutations.usersInvite), {
    name: 'addMutation'
  }),
  gqlEditMutation: graphql(gql(mutations.usersEdit), {
    name: 'editMutation'
  }),
  gqlRemoveMutation: graphql(gql(mutations.usersSetActiveStatus), {
    name: 'removeMutation'
  }),
  ListComponent: UserList
});
