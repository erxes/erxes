import { contentCmsMutations } from '@/cms/graphql/mutations/cms';
import { postMutations } from '@/cms/graphql/mutations/posts';
import { contentCmsTagMutations } from '@/cms/graphql/mutations/tag';

export const mutations = {
  ...contentCmsMutations,
  ...postMutations,
  ...contentCmsTagMutations,
};
