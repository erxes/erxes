import { gql, graphql } from 'react-apollo';
import { commonListComposer } from '/imports/react-ui/settings/utils';
// TODO: create directory named graphql and put queries inside it
import queries from '../../queries';
import { TopicList } from '../../components';

export default commonListComposer({
  name: 'knowledgeBaseTopics',
  gqlListQuery: graphql(gql(queries.getTopicList), {
    name: 'listQuery',
  }),
  gqlTotalCountQuery: graphql(gql(queries.getTopicCount), {
    name: 'totalCountQuery',
  }),
  ListComponent: TopicList,
});
