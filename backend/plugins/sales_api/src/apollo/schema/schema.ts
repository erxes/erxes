import {
  mutations as BoardMutations,
  queries as BoardQueries,
  types as BoardTypes,
} from '@/sales/graphql/schemas/board';

import { TypeExtensions } from '@/sales/graphql/schemas/extensions';

import {
  mutations as PipelineMutations,
  queries as PipelineQueries,
  types as PipelineTypes,
} from '@/sales/graphql/schemas/pipeline';

import {
  mutations as StageMutations,
  queries as StageQueries,
  types as StageTypes,
} from '@/sales/graphql/schemas/stage';

import {
  mutations as DealMutations,
  queries as DealQueries,
  types as DealTypes,
} from '@/sales/graphql/schemas/deal';

import {
  mutations as LabelMutations,
  queries as LabelQueries,
  types as LabelTypes,
} from '@/sales/graphql/schemas/label';

import {
  mutations as ChecklistMutations,
  queries as ChecklistQueries,
  types as ChecklistTypes,
} from '@/sales/graphql/schemas/checklist';

export const types = `
  ${TypeExtensions}
  ${BoardTypes}
  ${PipelineTypes}
  ${StageTypes}
  ${DealTypes}
  ${LabelTypes}
  ${ChecklistTypes}
`;

export const queries = `
  ${BoardQueries}
  ${PipelineQueries}
  ${StageQueries}
  ${DealQueries}
  ${LabelQueries}
  ${ChecklistQueries}
`;

export const mutations = `
   ${BoardMutations}
   ${PipelineMutations}
   ${StageMutations}
   ${DealMutations}
   ${LabelMutations}
   ${ChecklistMutations}
`;

export default { types, queries, mutations };
