import {
  mutations as TaskMutations,
  queries as TaskQueries,
  types as TaskTypes,
} from '@/task/graphql/schemas/task';

import {
  mutations as ProjectMutations,
  queries as ProjectQueries,
  types as ProjectTypes,
} from '@/project/graphql/schema/project';

import {
  mutations as TeamMutations,
  queries as TeamQueries,
  types as TeamTypes,
} from '@/team/graphql/schemas/team';

import {
  queries as ActivityQueries,
  types as ActivityTypes,
} from '@/activity/graphql/schemas/activity';
import {
  mutations as NoteMutations,
  queries as NoteQueries,
  types as NoteTypes,
} from '@/note/graphql/schemas/note';
import {
  mutations as StatusMutations,
  queries as StatusQueries,
  types as StatusTypes,
} from '@/status/graphql/schema/status';

import {
  mutations as CycleMutations,
  queries as CycleQueries,
  types as CycleTypes,
} from '@/cycle/graphql/schemas/cycle';

import {
  mutations as MilestoneMutations,
  queries as MilestoneQueries,
  types as MilestoneTypes,
} from '@/milestone/graphql/schemas/milestone';

import {
  mutations as TriageMutations,
  queries as TriageQueries,
  types as TriageTypes,
} from '@/task/graphql/schemas/triage';

export const types = `
  ${TaskTypes}
  ${ProjectTypes}
  ${TeamTypes}
  ${StatusTypes}
  ${NoteTypes}
  ${ActivityTypes}
  ${CycleTypes}
  ${MilestoneTypes}
  ${TriageTypes}
`;

export const queries = `
  ${TaskQueries}
  ${ProjectQueries}
  ${TeamQueries}
  ${StatusQueries}
  ${NoteQueries}
  ${ActivityQueries}
  ${CycleQueries}
  ${MilestoneQueries}
  ${TriageQueries}
`;

export const mutations = `
  ${TaskMutations}
  ${ProjectMutations} 
  ${TeamMutations}
  ${StatusMutations}
  ${NoteMutations}
  ${CycleMutations}
  ${MilestoneMutations}
  ${TriageMutations}
`;

export default { types, queries, mutations };
