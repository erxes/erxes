import gql from 'graphql-tag';
import { generatePaginationParams } from 'modules/common/utils/router';
import { graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import { List } from '../components';
import { mutations, queries } from '../graphql';

type Props = {
  queryParams: any;
};

export default commonListComposer<Props>({
  text: 'response template',
  name: 'responseTemplates',
  stringEditMutation: mutations.responseTemplatesEdit,
  stringAddMutation: mutations.responseTemplatesAdd,

  gqlListQuery: graphql(gql(queries.responseTemplates), {
    name: 'listQuery',
    options: ({ queryParams }: { queryParams: any }) => {
      return {
        notifyOnNetworkStatusChange: true,
        variables: generatePaginationParams(queryParams)
      };
    }
  }),

  gqlTotalCountQuery: graphql(gql(queries.responseTemplatesTotalCount), {
    name: 'totalCountQuery'
  }),

  gqlAddMutation: graphql(gql(mutations.responseTemplatesAdd), {
    name: 'addMutation'
  }),

  gqlEditMutation: graphql(gql(mutations.responseTemplatesEdit), {
    name: 'editMutation'
  }),

  gqlRemoveMutation: graphql(gql(mutations.responseTemplatesRemove), {
    name: 'removeMutation'
  }),

  ListComponent: List
});
