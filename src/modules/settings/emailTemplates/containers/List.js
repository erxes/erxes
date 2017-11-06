import { gql, graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import { List } from '../components';

const commonParamsDef = `
  $name: String!,
  $content: String,
`;

const commonParams = `
  name: $name,
  content: $content,
`;

export default commonListComposer({
  name: 'emailTemplates',

  gqlListQuery: graphql(
    gql`
      query objects($params: JSON) {
        emailTemplates(params: $params) {
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
            params: queryParams
          }
        };
      }
    }
  ),

  gqlTotalCountQuery: graphql(
    gql`
      query totalEmailTemplatesCount {
        emailTemplatesTotalCount
      }
    `,
    {
      name: 'totalCountQuery'
    }
  ),

  gqlAddMutation: graphql(
    gql`
      mutation emailTemplatesAdd(${commonParamsDef}) {
        emailTemplatesAdd(${commonParams}) {
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
      mutation emailTemplatesEdit($_id: String!, ${commonParamsDef}) {
        emailTemplatesEdit(_id: $_id, ${commonParams}) {
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
      mutation emailTemplatesRemove($_id: String!) {
        emailTemplatesRemove(_id: $_id)
      }
    `,
    {
      name: 'removeMutation'
    }
  ),

  ListComponent: List
});
