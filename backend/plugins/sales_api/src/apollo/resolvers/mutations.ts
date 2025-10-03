import { boardMutations } from '~/modules/sales/graphql/resolvers/mutations/boards';
import { checklistMutations } from '~/modules/sales/graphql/resolvers/mutations/checklists';
import { dealMutations } from '~/modules/sales/graphql/resolvers/mutations/deals';
import { pipelineLabelMutations } from '~/modules/sales/graphql/resolvers/mutations/labels';
import { pipelineMutations } from '~/modules/sales/graphql/resolvers/mutations/pipelines';
import { stageMutations } from '~/modules/sales/graphql/resolvers/mutations/stages';

// pos section
import {
  pos as MutationsPos,
  order as MutationsOrder,
  cover as MutationsCover,
} from '@/pos/graphql/resolvers/mutations';

export const mutations = {
  ...boardMutations,
  ...pipelineMutations,
  ...stageMutations,
  ...dealMutations,
  ...pipelineLabelMutations,
  ...checklistMutations,
  ...MutationsPos,
  ...MutationsOrder,
  ...MutationsCover,
};
