import gql from 'graphql-tag';
import { generatePaginationParams } from 'modules/common/utils/router';
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

type Props = {
  queryParams: any;
};

export default commonListComposer<Props>({
  text: 'response template',

  name: 'responseTemplates',

  gqlListQuery: graphql(
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
      options: ({ queryParams }: { queryParams: any }) => {
        return {
          notifyOnNetworkStatusChange: true,
          variables: generatePaginationParams(queryParams)
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
