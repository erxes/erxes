import { gql, graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import { BrandList } from '../components';

const commonParamsDef = `
  $name: String!,
  $description: String,
`;

const commonParams = `
  name: $name,
  description: $description,
`;

export default commonListComposer({
  name: 'brands',

  gqlListQuery: graphql(
    gql`
      query objects($params: JSON) {
        brands(params: $params) {
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
          variables: { params: queryParams }
        };
      }
    }
  ),

  gqlTotalCountQuery: graphql(
    gql`
      query totalBrandsCount {
        brandsTotalCount
      }
    `,
    {
      name: 'totalCountQuery'
    }
  ),

  gqlAddMutation: graphql(
    gql`
      mutation brandsAdd(${commonParamsDef}) {
        brandsAdd(${commonParams}) {
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
      mutation brandsEdit($_id: String!, ${commonParamsDef}) {
        brandsEdit(_id: $_id, ${commonParams}) {
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
      mutation brandsRemove($_id: String!) {
        brandsRemove(_id: $_id)
      }
    `,
    {
      name: 'removeMutation'
    }
  ),

  ListComponent: BrandList
});
