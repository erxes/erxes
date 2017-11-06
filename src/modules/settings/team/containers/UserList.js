import { gql, graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import { UserList } from '../components';

const commonParamsDef = `
  $username: String!,
  $email: String!,
  $role: String!
  $details: UserDetails,
  $channelIds: [String],
  $password: String!,
  $passwordConfirmation: String!
`;

const commonParams = `
  username: $username,
  email: $email,
  role: $role,
  details: $details,
  channelIds: $channelIds,
  password: $password,
  passwordConfirmation: $passwordConfirmation
`;

export default commonListComposer({
  name: 'users',

  gqlListQuery: graphql(
    gql`
      query objects($params: JSON) {
        users(params: $params) {
          _id
          username
          email
          role
          details
        }
      }
    `,
    {
      name: 'listQuery',
      options: ({ queryParams }) => {
        return {
          variables: {
            params: queryParams
          }
        };
      }
    }
  ),

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

  gqlAddMutation: graphql(
    gql`
      mutation usersAdd(${commonParamsDef}) {
        usersAdd(${commonParams}) {
          _id
        }
      }
    `,
    {
      name: 'addMutation'
    }
  ),

  gqlEditMutation: graphql(
    gql`
      mutation usersEdit($_id: String!, ${commonParamsDef}) {
        usersEdit(_id: $_id, ${commonParams}) {
          _id
        }
      }
    `,
    {
      name: 'editMutation'
    }
  ),

  gqlRemoveMutation: graphql(
    gql`
      mutation usersRemove($_id: String) {
        usersRemove(_id: $_id)
      }
    `,
    {
      name: 'removeMutation'
    }
  ),

  ListComponent: UserList
});
