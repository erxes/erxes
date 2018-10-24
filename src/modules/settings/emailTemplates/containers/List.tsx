import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import { List } from '../components';
import { IEmailTemplate } from '../types';

const commonParamsDef = `
  $name: String!,
  $content: String,
`;

const commonParams = `
  name: $name,
  content: $content,
`;

export type EmailTemplatesQueryResponse = {
  emailTemplates: IEmailTemplate[];
  loading: boolean;
  refetch: () => void;
};

export default commonListComposer({
  name: 'emailTemplates',

  gqlListQuery: graphql(
    gql`
      query emailTemplates($page: Int, $perPage: Int) {
        emailTemplates(page: $page, perPage: $perPage) {
          _id
          name
          content
        }
      }
    `,
    {
      name: 'listQuery',
      options: ({ queryParams }: { queryParams: any }) => {
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
