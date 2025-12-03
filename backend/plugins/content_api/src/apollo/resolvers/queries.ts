import { contentCmsQueries } from '@/cms/graphql/queries/cms';
import { postQueries } from '@/cms/graphql/queries/posts';
import { contentCmsTagQueries } from '@/cms/graphql/queries/tag';

export const queries = {
  ...contentCmsQueries,
  ...postQueries,
  ...contentCmsTagQueries,
};
