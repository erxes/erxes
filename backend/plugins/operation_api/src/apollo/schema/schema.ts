import {
  mutations as TaskMutations,
  queries as TaskQueries,
  types as TaskTypes,
} from '@/task/graphql/schemas/task';

import {
  queries as ProjectQueries,
  types as ProjectTypes,
  mutations as ProjectMutations,
} from '@/project/graphql/schema/project';

import {
  queries as TeamQueries,
  types as TeamTypes,
  mutations as TeamMutations,
} from '@/team/graphql/schemas/team';

import {
  queries as StatusQueries,
  types as StatusTypes,
  mutations as StatusMutations,
} from '@/status/graphql/schema/status';
import {
  queries as NoteQueries,
  types as NoteTypes,
  mutations as NoteMutations,
} from '@/note/graphql/schemas/note';
import {
  queries as ActivityQueries,
  types as ActivityTypes,
} from '@/activity/graphql/schemas/activity';

import {
  queries as CycleQueries,
  types as CycleTypes,
  mutations as CycleMutations,
} from '@/cycle/graphql/schemas/cycle';

export const types = `
  ${TaskTypes}
  ${ProjectTypes}
  ${TeamTypes}
  ${StatusTypes}
  ${NoteTypes}
  ${ActivityTypes}
  ${CycleTypes}
`;

export const queries = `
  ${TaskQueries}
  ${ProjectQueries}
  ${TeamQueries}
  ${StatusQueries}
  ${NoteQueries}
  ${ActivityQueries}
  ${CycleQueries}
`;

export const mutations = `
  ${TaskMutations}
  ${ProjectMutations} 
  ${TeamMutations}
  ${StatusMutations}
  ${NoteMutations}
  ${CycleMutations}
`;

export default { types, queries, mutations };
