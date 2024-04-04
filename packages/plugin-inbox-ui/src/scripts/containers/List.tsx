import { gql } from '@apollo/client';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { graphql } from '@apollo/client/react/hoc';
import { commonListComposer } from '@erxes/ui/src/utils';
import List from '../components/List';
import { mutations, queries } from '../graphql';

type Props = {
  queryParams: any;
};

export default commonListComposer<Props>({
  text: 'script',
  label: 'scripts',
  stringEditMutation: mutations.scriptsEdit,
  stringAddMutation: mutations.scriptsAdd,

  gqlListQuery: graphql(gql(queries.scripts), {
    name: 'listQuery',
    options: ({ queryParams }: { queryParams: any }) => {
      return {
        notifyOnNetworkStatusChange: true,
        variables: generatePaginationParams(queryParams)
      };
    }
  }),

  gqlTotalCountQuery: graphql(gql(queries.totalScriptsCount), {
    name: 'totalCountQuery'
  }),

  gqlAddMutation: graphql(gql(mutations.scriptsAdd), {
    name: 'addMutation'
  }),

  gqlEditMutation: graphql(gql(mutations.scriptsEdit), {
    name: 'editMutation'
  }),

  gqlRemoveMutation: graphql(gql(mutations.scriptsRemove), {
    name: 'removeMutation'
  }),

  ListComponent: List
});
