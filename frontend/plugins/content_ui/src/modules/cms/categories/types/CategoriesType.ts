import type { CmsCategoriesQuery } from '~/gql/graphql';
import { CustomFieldValue } from '../../posts/CustomFieldInput';

export type ICategory = NonNullable<
  NonNullable<NonNullable<CmsCategoriesQuery['cmsCategories']>['list']>[number]
>;

export type ICategoryRow = ICategory & { _depth?: number };

export interface IUser {
  _id: string;
  details: {
    fullName: string;
    avatar: string;
  };
}

export interface PostCategoryInput {
  name: string;
  description?: string;
  slug?: string;
  status?: string;
  parentId?: string;
  clientPortalId?: string;
  language?: string;
  customFieldsData?: { field: string; value: CustomFieldValue }[];
}
