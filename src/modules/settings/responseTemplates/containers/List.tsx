import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import { List } from '../components';

const commonParamsDef = `
  $brandId: String!,
  $name: String!,
  $content: String,
`;

const commonParams = `
  brandId: $brandId,
  name: $name,
  content: $content,
`;

export default commonListComposer({
  name: 'responseTemplates',

  gqlListQuery: graphql<{ queryParams: any }>(
    gql`
      query responseTemplates($page: Int, $perPage: Int) {
        responseTemplates(page: $page, perPage: $perPage) {
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
      query totalResponseTemplatesCount {
        responseTemplatesTotalCount
      }
    `,
    {
      name: 'totalCountQuery'
    }
  ),

  gqlAddMutation: graphql(
    gql`
      mutation responseTemplatesAdd(${commonParamsDef}) {
        responseTemplatesAdd(${commonParams}) {
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
      mutation responseTemplatesEdit($_id: String!, ${commonParamsDef}) {
        responseTemplatesEdit(_id: $_id, ${commonParams}) {
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
      mutation responseTemplatesRemove($_id: String!) {
        responseTemplatesRemove(_id: $_id)
      }
    `,
    {
      name: 'removeMutation'
    }
  ),

  ListComponent: List
});
