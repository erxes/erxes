import { gql, graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import { ChannelList } from '../components';

export default commonListComposer({
  name: 'channels',

  gqlListQuery: graphql(
    gql`
      query channels($limit: Int!) {
        channels(limit: $limit) {
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
          variables: {
            limit: queryParams.limit || 10,
          },
        };
      },
    },
  ),

  gqlTotalCountQuery: graphql(
    gql`
      query totalChannelsCount {
        totalChannelsCount
      }
    `,
    {
      name: 'totalCountQuery',
    },
  ),

  ListComponent: ChannelList,
});
