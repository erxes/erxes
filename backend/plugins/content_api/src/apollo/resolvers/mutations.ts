import { contentCmsMutations } from '@/cms/graphql/mutations/cms';
import { postMutations } from '@/cms/graphql/mutations/posts';

export const mutations = {
  ...contentCmsMutations,
  ...postMutations,
};
