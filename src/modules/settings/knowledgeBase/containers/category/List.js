import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { commonListComposer } from '../../../utils';
import { CategoryList } from '../../components';
import {
  knowledgeBaseCategories,
  knowledgeBaseCategoriesTotalCount
} from '../../graphql/queries';
import {
  knowledgeBaseCategoriesAdd,
  knowledgeBaseCategoriesEdit,
  knowledgeBaseCategoriesRemove
} from '../../graphql/mutations';

export default commonListComposer({
  name: 'knowledgeBaseCategories',

  gqlAddMutation: graphql(gql(knowledgeBaseCategoriesAdd), {
    name: 'addMutation'
  }),

  gqlEditMutation: graphql(gql(knowledgeBaseCategoriesEdit), {
    name: 'editMutation'
  }),

  gqlRemoveMutation: graphql(gql(knowledgeBaseCategoriesRemove), {
    name: 'removeMutation'
  }),

  gqlListQuery: graphql(gql(knowledgeBaseCategories), {
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
  }),

  gqlTotalCountQuery: graphql(gql(knowledgeBaseCategoriesTotalCount), {
    name: 'totalCountQuery'
  }),

  ListComponent: CategoryList
});
