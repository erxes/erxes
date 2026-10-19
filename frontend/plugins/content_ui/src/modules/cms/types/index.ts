import type { ContentCmsListQuery } from '~/gql/graphql';
export { IUser, ICategory, ITopic } from '../../shared/types';

export type IWebsite = NonNullable<
  NonNullable<ContentCmsListQuery['contentCMSList']>[number]
>;
