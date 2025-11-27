import { contentCmsQueries } from '@/cms/graphql/queries/cms';
import { postQueries } from '@/cms/graphql/queries/posts';

export const queries = {
  ...contentCmsQueries,
  ...postQueries,
};
