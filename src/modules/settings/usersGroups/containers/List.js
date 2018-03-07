import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { commonListComposer } from '../../utils';
import { GroupList } from '../components';
import { queries, mutations } from '../graphql';

export default commonListComposer({
  name: 'usersGroups',

  gqlListQuery: graphql(gql(queries.usersGroups), {
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

  gqlTotalCountQuery: graphql(gql(queries.totalCount), {
    name: 'totalCountQuery'
  }),

  gqlAddMutation: graphql(gql(mutations.usersGroupsAdd), {
    name: 'addMutation'
  }),

  gqlEditMutation: graphql(gql(mutations.usersGroupsEdit), {
    name: 'editMutation'
  }),

  gqlRemoveMutation: graphql(gql(mutations.usersGroupsRemove), {
    name: 'removeMutation'
  }),

  ListComponent: GroupList
});
