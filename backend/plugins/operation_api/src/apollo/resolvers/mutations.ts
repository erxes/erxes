import { taskMutations } from '@/task/graphql/resolvers/mutations/task';
import { projectMutations } from '@/project/graphql/resolvers/mutations/project';
import { teamMutations } from '@/team/graphql/resolvers/mutations/team';
import { statusMutations } from '@/status/graphql/resolvers/mutations/status';
import { noteMutations } from '@/note/graphql/resolvers/mutations/note';
import { cycleMutations } from '@/cycle/graphql/resolvers/mutations/cycles';

export const mutations = {
  ...taskMutations,
  ...projectMutations,
  ...teamMutations,
  ...statusMutations,
  ...noteMutations,
  ...cycleMutations,
};
