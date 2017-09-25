import { gql, graphql } from 'react-apollo';
import { commonListComposer } from '/imports/react-ui/settings/utils';
import { queries } from '../../graphql';
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
