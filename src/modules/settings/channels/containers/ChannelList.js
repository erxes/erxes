import { gql, graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import { ChannelList } from '../components';

const commonParamsDef = `
  $name: String!,
  $description: String,
  $memberIds: [String],
  $integrationIds: [String]
`;

const commonParams = `
  name: $name,
  description: $description,
  memberIds: $memberIds,
  integrationIds: $integrationIds
`;

export default commonListComposer({
  name: 'channels',

  gqlListQuery: graphql(
    gql`
      query channels($page: Int, $perPage: Int, $memberIds: [String]) {
        channels(page: $page, perPage: $perPage, memberIds: $memberIds) {
          _id
          name
          description
          integrationIds
          memberIds
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
            perPage: queryParams.perPage || 20,
            memberIds: queryParams.memberIds
          }
        };
      }
    }
  ),

  gqlTotalCountQuery: graphql(
    gql`
      query totalChannelsCount {
        channelsTotalCount
      }
    `,
    {
      name: 'totalCountQuery'
    }
  ),

  gqlAddMutation: graphql(
    gql`
      mutation channelsAdd(${commonParamsDef}) {
        channelsAdd(${commonParams}) {
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
      mutation channelsEdit($_id: String!, ${commonParamsDef}) {
        channelsEdit(_id: $_id, ${commonParams}) {
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
      mutation channelsRemove($_id: String!) {
        channelsRemove(_id: $_id)
      }
    `,
    {
      name: 'removeMutation'
    }
  ),

  ListComponent: ChannelList
});
