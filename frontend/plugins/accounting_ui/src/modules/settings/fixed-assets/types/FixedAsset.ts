import type {
  AccountingFixedAssetCategoriesQuery,
  AccountingFixedAssetDetailQuery,
  AccountingFixedAssetOwnerRecordsQuery,
  AccountingFixedAssetLocationRemainderQuery,
} from '~/gql/graphql';
import type { GraphqlView } from '@/utils/graphql';
import { z } from 'zod';
import {
  fixedAssetCategorySchema,
  fixedAssetSchema,
} from '../constants/schema';

export type IFixedAssetCategory = GraphqlView<
  NonNullable<
    NonNullable<
      AccountingFixedAssetCategoriesQuery['fixedAssetCategories']
    >[number]
  >
>;

export type IFixedAsset = GraphqlView<
  NonNullable<AccountingFixedAssetDetailQuery['fixedAssetDetail']>
>;

export type IFxaOwnerRecord = GraphqlView<
  NonNullable<
    NonNullable<
      AccountingFixedAssetOwnerRecordsQuery['fxaOwnerRecords']
    >[number]
  >
>;

export type IFixedAssetLocationRemainder = GraphqlView<
  NonNullable<
    AccountingFixedAssetLocationRemainderQuery['fixedAssetLocationRemainder']
  >
>;

export type TFixedAssetCategoryForm = z.infer<typeof fixedAssetCategorySchema>;

export type TFixedAssetForm = z.infer<typeof fixedAssetSchema>;
