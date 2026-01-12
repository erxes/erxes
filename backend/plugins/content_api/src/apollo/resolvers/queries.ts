import { contentCmsQueries } from '@/cms/graphql/queries/cms';
import { postQueries } from '@/cms/graphql/queries/posts';
import { contentCmsTagQueries } from '@/cms/graphql/queries/tag';
import { contentCmsCategoryQueries } from '@/cms/graphql/queries/category';
import contentCmsMenuQueries from '@/cms/graphql/queries/menu';
import contentCmsPageQueries from '@/cms/graphql/queries/page';
import customPostTypeQueries from '@/cms/graphql/queries/customPostType';

export const queries = {
  ...contentCmsQueries,
  ...postQueries,
  ...contentCmsTagQueries,
  ...contentCmsCategoryQueries,
  ...contentCmsMenuQueries,
  ...contentCmsPageQueries,
  ...customPostTypeQueries,
};
