import { gql, graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import { List } from '../components';

export default commonListComposer({
  name: 'emailTemplates',

  gqlListQuery: graphql(
    gql`
      query objects($limit: Int!) {
        emailTemplates(limit: $limit) {
          _id
          name
          content
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
      query totalEmailTemplatesCount {
        emailTemplatesTotalCount
      }
    `,
    {
      name: 'totalCountQuery',
    },
  ),

  ListComponent: List,
});
