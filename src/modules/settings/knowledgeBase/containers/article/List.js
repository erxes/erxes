import { gql, graphql } from 'react-apollo';
import { commonListComposer } from '../../../utils';
import { ArticleList } from '../../components';
import {
  knowledgeBaseArticles,
  knowledgeBaseArticlesTotalCount
} from '../../graphql/queries';
import {
  knowledgeBaseArticlesAdd,
  knowledgeBaseArticlesEdit,
  knowledgeBaseArticlesRemove
} from '../../graphql/mutations';

export default commonListComposer({
  name: 'knowledgeBaseArticles',

  gqlAddMutation: graphql(gql(knowledgeBaseArticlesAdd), {
    name: 'addMutation'
  }),

  gqlEditMutation: graphql(gql(knowledgeBaseArticlesEdit), {
    name: 'editMutation'
  }),

  gqlRemoveMutation: graphql(gql(knowledgeBaseArticlesRemove), {
    name: 'removeMutation'
  }),

  gqlListQuery: graphql(gql(knowledgeBaseArticles), {
    name: 'listQuery',
    options: ({ queryParams }) => {
      return {
        variables: {
          limit: queryParams.limit || 20
        }
      };
    }
  }),

  gqlTotalCountQuery: graphql(gql(knowledgeBaseArticlesTotalCount), {
    name: 'totalCountQuery'
  }),

  ListComponent: ArticleList
});
