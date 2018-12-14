import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import { List } from '../components';

const commonParamsDef = `
  $name: String!,
  $messengerId: String,
  $leadIds: [String],
  $kbTopicId: String,
`;

const commonParams = `
  name: $name,
  messengerId: $messengerId,
  leadIds: $leadIds,
  kbTopicId: $kbTopicId,
`;

type Props = {
  queryParams: any;
};

export default commonListComposer<Props>({
  name: 'scripts',

  gqlListQuery: graphql(
    gql`
      query scripts($page: Int, $perPage: Int) {
        scripts(page: $page, perPage: $perPage) {
          _id
          name
          messengerId
          messenger {
            _id
            name
          }
          leadIds
          leads {
            _id
            name
          }
          kbTopicId
          kbTopic {
            _id
            title
          }
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
      query totalScriptsCount {
        scriptsTotalCount
      }
    `,
    {
      name: 'totalCountQuery'
    }
  ),

  gqlAddMutation: graphql(
    gql`
      mutation scriptsAdd(${commonParamsDef}) {
        scriptsAdd(${commonParams}) {
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
      mutation scriptsEdit($_id: String!, ${commonParamsDef}) {
        scriptsEdit(_id: $_id, ${commonParams}) {
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
      mutation scriptsRemove($_id: String!) {
        scriptsRemove(_id: $_id)
      }
    `,
    {
      name: 'removeMutation'
    }
  ),

  ListComponent: List
});
