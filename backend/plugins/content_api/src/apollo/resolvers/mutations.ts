import { contentCmsMutations } from '@/cms/graphql/mutations/cms';
import { postMutations } from '@/cms/graphql/mutations/posts';
import { contentCmsTagMutations } from '@/cms/graphql/mutations/tag';
import { contentCmsCategoryMutations } from '@/cms/graphql/mutations/category';
import contentCmsMenuMutations from '@/cms/graphql/mutations/menu';
import contentCmsPageMutations from '@/cms/graphql/mutations/page';
import customPostTypeMutations from '@/cms/graphql/mutations/customPostType';
import translationMutations from '@/cms/graphql/mutations/translation';

export const mutations = {
  ...contentCmsMutations,
  ...postMutations,
  ...contentCmsTagMutations,
  ...contentCmsCategoryMutations,
  ...contentCmsMenuMutations,
  ...contentCmsPageMutations,
  ...customPostTypeMutations,
  ...translationMutations,
};
