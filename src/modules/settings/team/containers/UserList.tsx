import gql from 'graphql-tag';
import { generatePaginationParams } from 'modules/common/utils/router';
import { graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import { UserList } from '../components';
import { queries } from '../graphql';

const commonParamsDef = `
  $username: String!,
  $email: String!,
  $role: String!
  $details: UserDetails,
  $links: UserLinks,
  $channelIds: [String],
`;

const commonParams = `
  username: $username,
  email: $email,
  role: $role,
  details: $details,
  links: $links,
  channelIds: $channelIds,
`;

const options = ({ queryParams }: { queryParams: any }) => {
  return {
    notifyOnNetworkStatusChange: true,
    variables: {
      ...generatePaginationParams(queryParams),
      searchValue: queryParams.searchValue,
      isActive:
        !queryParams.isActive || queryParams.isActive === 'true' ? true : false
    }
  };
};

export default commonListComposer<{ queryParams: any; history: any }>({
  name: 'users',

  gqlListQuery: graphql(gql(queries.users), {
    name: 'listQuery',
    options
  }),

  gqlTotalCountQuery: graphql(gql(queries.usersTotalCount), {
    name: 'totalCountQuery',
    options
  }),

  gqlAddMutation: graphql(
    gql`
      mutation usersInvite($emails: [String]) {
        usersInvite(emails: $emails)
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

  gqlStatusChangedMutation: graphql(
    gql`
      mutation usersSetActiveStatus($_id: String!) {
        usersSetActiveStatus(_id: $_id) {
          _id
        }
      }
    `,
    {
      name: 'statusChangedMutation'
    }
  ),

  ListComponent: UserList
});
