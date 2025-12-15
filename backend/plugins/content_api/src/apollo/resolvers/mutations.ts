import { contentCmsMutations } from '@/cms/graphql/mutations/cms';
import { postMutations } from '@/cms/graphql/mutations/posts';
import { contentCmsTagMutations } from '@/cms/graphql/mutations/tag';
import { contentCmsCategoryMutations } from '@/cms/graphql/mutations/category';

export const mutations = {
  ...contentCmsMutations,
  ...postMutations,
  ...contentCmsTagMutations,
  ...contentCmsCategoryMutations,
};
