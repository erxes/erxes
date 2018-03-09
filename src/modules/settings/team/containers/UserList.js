import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { commonListComposer } from '../../utils';
import { UserList } from '../components';
import { queries, mutations } from '../graphql';

export default commonListComposer({
  name: 'users',

  gqlListQuery: graphql(gql(queries.users), {
    name: 'listQuery',
    options: ({ queryParams }) => {
      return {
        notifyOnNetworkStatusChange: true,
        variables: {
          page: queryParams.page,
          perPage: queryParams.perPage || 20
        }
      };
    }
  }),

  gqlTotalCountQuery: graphql(
    gql`
      query totalUsersCount {
        usersTotalCount
      }
    `,
    {
      name: 'totalCountQuery'
    }
  ),

  gqlAddMutation: graphql(gql(mutations.usersAdd), {
    name: 'addMutation'
  }),

  gqlEditMutation: graphql(gql(mutations.usersEdit), {
    name: 'editMutation'
  }),

  gqlRemoveMutation: graphql(gql(mutations.usersRemove), {
    name: 'removeMutation'
  }),

  ListComponent: UserList
});
