import { gql, graphql } from 'react-apollo';
// TODO: create directory named graphql and put queries inside it
import queries from '../../queries';
import { ArticleList } from '../../components';
import { commonListComposer } from '/imports/react-ui/settings/utils';

export default commonListComposer({
  name: 'knowledgeBaseArticles',
  gqlListQuery: graphql(gql(queries.getArticleList), {
    name: 'listQuery',
  }),
  gqlTotalCountQuery: graphql(gql(queries.getArticleCount), {
    name: 'totalCountQuery',
  }),
  ListComponent: ArticleList,
});
