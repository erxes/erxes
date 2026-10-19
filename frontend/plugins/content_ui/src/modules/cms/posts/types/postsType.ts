import type { CmsPostListQuery } from '~/gql/graphql';

export type Posts = NonNullable<
  NonNullable<NonNullable<CmsPostListQuery['cmsPostList']>['posts']>[number]
>;
