import { cycleMutations } from '@/cycle/graphql/resolvers/mutations/cycles';
import { milestoneMutations } from '@/milestone/graphql/resolvers/mutations/milestone';
import { noteMutations } from '@/note/graphql/resolvers/mutations/note';
import { projectMutations } from '@/project/graphql/resolvers/mutations/project';
import { statusMutations } from '@/status/graphql/resolvers/mutations/status';
import { taskMutations } from '@/task/graphql/resolvers/mutations/task';
import { teamMutations } from '@/team/graphql/resolvers/mutations/team';

export const mutations = {
  ...taskMutations,
  ...projectMutations,
  ...teamMutations,
  ...statusMutations,
  ...noteMutations,
  ...cycleMutations,
  ...milestoneMutations,
};
