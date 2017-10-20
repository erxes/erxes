import { gql, graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import { List } from '../components';

export default commonListComposer({
  name: 'responseTemplates',

  gqlListQuery: graphql(
    gql`
      query objects($limit: Int!) {
        responseTemplates(limit: $limit) {
          _id
          name
          brandId
          brand {
            _id
            name
          }
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
      query totalResponseTemplatesCount {
        responseTemplatesTotalCount
      }
    `,
    {
      name: 'totalCountQuery',
    },
  ),

  ListComponent: List,
});
