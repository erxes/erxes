import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { commonListComposer } from '../../utils';
import { UserList } from '../components';

const commonParamsDef = `
  $username: String!,
  $email: String!,
  $role: String!
  $details: UserDetails,
  $links: UserLinks,
  $channelIds: [String],
  $password: String!,
  $passwordConfirmation: String!
`;

const commonParams = `
  username: $username,
  email: $email,
  role: $role,
  details: $details,
  links: $links,
  channelIds: $channelIds,
  password: $password,
  passwordConfirmation: $passwordConfirmation
`;

export default commonListComposer({
  name: 'users',

  gqlListQuery: graphql(
    gql`
      query users($page: Int, $perPage: Int) {
        users(page: $page, perPage: $perPage) {
          _id
          username
          email
          role
          details {
            avatar
            fullName
            position
            description
            location
            twitterUsername
          }
          links {
            linkedIn
            twitter
            facebook
            github
            youtube
            website
          }
        }
      }
    `,
    {
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
      mutation usersRemove($_id: String!) {
        usersRemove(_id: $_id)
      }
    `,
    {
      name: 'removeMutation'
    }
  ),

  ListComponent: UserList
});
