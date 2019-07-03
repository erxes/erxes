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
  label: 'responseTemplates',
  stringEditMutation: mutations.responseTemplatesEdit,
  stringAddMutation: mutations.responseTemplatesAdd,

  gqlListQuery: graphql(gql(queries.responseTemplates), {
    name: 'listQuery',
    options: ({ queryParams }: { queryParams: any }) => {
      return {
        notifyOnNetworkStatusChange: true,
        variables: {
          searchValue: queryParams.searchValue,
          brandId: queryParams.brandId,
          ...generatePaginationParams(queryParams)
        }
      };
    }
  }),

  gqlTotalCountQuery: graphql(gql(queries.responseTemplatesTotalCount), {
    name: 'totalCountQuery',
    options: ({ queryParams }: { queryParams: any }) => {
      return {
        notifyOnNetworkStatusChange: true,
        variables: {
          searchValue: queryParams.searchValue,
          brandId: queryParams.brandId
        }
      };
    }
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
