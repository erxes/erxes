import type { CmsTagsQuery } from '~/gql/graphql';

export type CmsTag = NonNullable<
  NonNullable<NonNullable<CmsTagsQuery['cmsTags']>['tags']>[number]
>;

export interface TagFormData {
  name: string;
  slug: string;
  clientPortalId: string;
  colorCode: string;
  language?: string;
  translations?: {
    language: string;
    title: string;
    type: string;
  }[];
}
