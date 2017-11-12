import { gql, graphql } from 'react-apollo';
import { commonListComposer } from '../../../utils';
import {
  knowledgeBaseTopicsAdd,
  knowledgeBaseTopicsEdit,
  knowledgeBaseTopicsRemove
} from '../../graphql/mutations';
import {
  knowledgeBaseTopics,
  knowledgeBaseTopicsTotalCount
} from '../../graphql/queries';
import { TopicList } from '../../components';

export default commonListComposer({
  name: 'knowledgeBaseTopics',

  gqlAddMutation: graphql(gql(knowledgeBaseTopicsAdd), { name: 'addMutation' }),

  gqlEditMutation: graphql(gql(knowledgeBaseTopicsEdit), {
    name: 'editMutation'
  }),

  gqlRemoveMutation: graphql(gql(knowledgeBaseTopicsRemove), {
    name: 'removeMutation'
  }),

  gqlListQuery: graphql(gql(knowledgeBaseTopics), {
    name: 'listQuery',
    options: ({ queryParams }) => {
      return {
        variables: {
          page: queryParams.page,
          perPage: queryParams.perPage || 20
        }
      };
    }
  }),
  gqlTotalCountQuery: graphql(gql(knowledgeBaseTopicsTotalCount), {
    name: 'totalCountQuery'
  }),
  ListComponent: TopicList
});
