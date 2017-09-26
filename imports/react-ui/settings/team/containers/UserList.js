import { gql, graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import { UserList } from '../components';

export default commonListComposer({
  name: 'users',

  gqlListQuery: graphql(
    gql`
      query objects($limit: Int!) {
        users(limit: $limit) {
          _id
          username
          details
          emails
        }
      }
    `,
    {
      name: 'listQuery',
      options: ({ queryParams }) => {
        return {
          variables: {
            limit: queryParams.limit || 20,
          },
        };
      },
    },
  ),

  gqlTotalCountQuery: graphql(
    gql`
      query totalUsersCount {
        usersTotalCount
      }
    `,
    {
      name: 'totalCountQuery',
    },
  ),

  ListComponent: UserList,
});
