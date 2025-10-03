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

import {
  types as posTypes,
  queries as posQueries,
  mutations as posMutations,
} from '@/pos/graphql/schemas/pos';

import {
  types as posOrderTypes,
  queries as posOrderQueries,
  mutations as posOrderMutations,
} from '@/pos/graphql/schemas/orders';

import {
  types as posCoverTypes,
  queries as posCoverQueries,
  mutations as posCoverMutations,
} from '@/pos/graphql/schemas/covers';

import extendTypes from '@/pos/graphql/schemas/extendTypes';

export const types = `
  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }
  
  directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope
    inheritMaxAge: Boolean
  ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

  type SomeType {
    visibility: CacheControlScope
  }
  ${TypeExtensions}
  ${BoardTypes}
  ${PipelineTypes}
  ${StageTypes}
  ${DealTypes}
  ${LabelTypes}
  ${ChecklistTypes}
  ${extendTypes}
  ${posTypes()},
  ${posOrderTypes()},
  ${posCoverTypes},
`;

export const queries = `
  ${BoardQueries}
  ${PipelineQueries}
  ${StageQueries}
  ${DealQueries}
  ${LabelQueries}
  ${ChecklistQueries}
  ${posQueries}
  ${posOrderQueries}
  ${posCoverQueries}
`;

export const mutations = `
   ${BoardMutations}
   ${PipelineMutations}
   ${StageMutations}
   ${DealMutations}
   ${LabelMutations}
   ${ChecklistMutations}
   ${posMutations}
   ${posOrderMutations}
   ${posCoverMutations}
`;

export default { types, queries, mutations };
