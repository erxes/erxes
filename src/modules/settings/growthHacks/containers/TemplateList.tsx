import gql from 'graphql-tag';
import { generatePaginationParams } from 'modules/common/utils/router';
import { graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import TemplateList from '../components/TemplateList';
import { mutations, queries } from '../graphql';
import { IPipelineTemplate } from '../types';

export type PipelineTemplatesQueryResponse = {
  pipelineTemplates: IPipelineTemplate[];
  loading: boolean;
  refetch: () => void;
};

type Props = {
  queryParams: any;
};

export default commonListComposer<Props>({
  text: 'growth hack template',
  label: 'growth hackTemplates',
  stringEditMutation: mutations.pipelineTemplatesEdit,
  stringAddMutation: mutations.pipelineTemplatesAdd,

  gqlListQuery: graphql(gql(queries.pipelineTemplates), {
    name: 'listQuery',
    options: ({ queryParams }: { queryParams: any }) => {
      return {
        notifyOnNetworkStatusChange: true,
        variables: {
          ...generatePaginationParams(queryParams),
          type: 'growthHack'
        }
      };
    }
  }),

  gqlTotalCountQuery: graphql(gql(queries.totalCount), {
    name: 'totalCountQuery'
  }),

  gqlAddMutation: graphql(gql(mutations.pipelineTemplatesAdd), {
    name: 'addMutation'
  }),

  gqlEditMutation: graphql(gql(mutations.pipelineTemplatesEdit), {
    name: 'editMutation'
  }),

  gqlRemoveMutation: graphql(gql(mutations.pipelineTemplatesRemove), {
    name: 'removeMutation'
  }),

  ListComponent: TemplateList
});
