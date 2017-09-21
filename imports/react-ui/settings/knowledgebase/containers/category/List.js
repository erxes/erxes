import { gql, graphql } from 'react-apollo';
import { commonListComposer } from '/imports/react-ui/settings/utils';
// TODO: create directory named graphql and put queries inside it
import queries from '../../queries';
import { CategoryList } from '../../components';

export default commonListComposer({
  name: 'knowledgeBaseCategories', // TODO: name must start with lowercase letter
  gqlListQuery: graphql(gql(queries.getCategoryList), {
    name: 'listQuery',
  }),
  gqlTotalCountQuery: graphql(gql(queries.getCategoryCount), {
    name: 'totalCountQuery',
  }),
  ListComponent: CategoryList,
});
