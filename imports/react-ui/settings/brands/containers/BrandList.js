import { gql, graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import { BrandList } from '../components';

export default commonListComposer({
  name: 'brands',

  gqlListQuery: graphql(
    gql`
      query objects($limit: Int!) {
        brands(limit: $limit) {
          _id
          code
          name
          description
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
      query totalBrandsCount {
        totalBrandsCount
      }
    `,
    {
      name: 'totalCountQuery',
    },
  ),

  ListComponent: BrandList,
});
