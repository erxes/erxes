import { contentCmsQueries } from '@/cms/graphql/queries/cms';
import { postQueries } from '@/cms/graphql/queries/posts';
import { contentCmsTagQueries } from '@/cms/graphql/queries/tag';
import { contentCmsCategoryQueries } from '@/cms/graphql/queries/category';
import contentCmsMenuQueries from '@/cms/graphql/queries/menu';
import contentCmsPageQueries from '@/cms/graphql/queries/page';
import customPostTypeQueries from '@/cms/graphql/queries/customPostType';
import { webQueries } from '~/modules/webbuilder/graphql/resolvers/queries/web';
import { webPageQueries } from '~/modules/webbuilder/graphql/resolvers/queries/webPage';
import { webPostQueries } from '~/modules/webbuilder/graphql/resolvers/queries/webPosts';
import { webMenuQueries } from '~/modules/webbuilder/graphql/resolvers/queries/webMenu';

export const queries = {
  ...webQueries,
  ...postQueries,
  ...contentCmsTagQueries,
  ...contentCmsCategoryQueries,
  ...contentCmsMenuQueries,
  ...contentCmsPageQueries,
  ...customPostTypeQueries,
  ...contentCmsQueries,
  ...webPostQueries,
  ...webMenuQueries,
  ...webPageQueries,
};
