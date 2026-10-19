import type { CmsCustomPostTypesQuery } from '~/gql/graphql';

export type ICustomPostType = NonNullable<
  NonNullable<CmsCustomPostTypesQuery['cmsCustomPostTypes']>[number]
>;
