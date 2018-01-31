import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { commonListComposer } from '../../utils';
import { List } from '../components';

const commonParamsDef = `
  $title: String!,
  $description: String,
`;

const commonParams = `
  title: $title,
  description: $description,
`;

export default commonListComposer({
  name: 'forms',

  gqlListQuery: graphql(
    gql`
      query objects($page: Int, $perPage: Int) {
        forms(page: $page, perPage: $perPage) {
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
      query totalFormsCount {
        formsTotalCount
      }
    `,
    {
      name: 'totalCountQuery'
    }
  ),

  gqlAddMutation: graphql(
    gql`
      mutation formsAdd(${commonParamsDef}) {
        formsAdd(${commonParams}) {
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
      mutation formsEdit($_id: String!, ${commonParamsDef}) {
        formsEdit(_id: $_id, ${commonParams}) {
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
      mutation formsRemove($_id: String!) {
        formsRemove(_id: $_id)
      }
    `,
    {
      name: 'removeMutation'
    }
  ),

  ListComponent: List
});
