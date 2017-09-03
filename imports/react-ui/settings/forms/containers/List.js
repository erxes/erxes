import { gql, graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import { List } from '../components';

export default commonListComposer({
  name: 'forms',

  gqlListQuery: graphql(
    gql`
      query objects($limit: Int!) {
        forms(limit: $limit) {
          _id
          code
          title
          description
          createdDate
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
      query totalFormsCount {
        totalFormsCount
      }
    `,
    {
      name: 'totalCountQuery',
    },
  ),

  ListComponent: List,
});
