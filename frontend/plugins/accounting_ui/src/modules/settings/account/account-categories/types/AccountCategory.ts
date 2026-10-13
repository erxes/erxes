import type { AccountingAccountCategoryDetailQuery } from '~/gql/graphql';
import type { GraphqlView } from '@/utils/graphql';
import { accountCategorySchema } from '../constants/accountCategorySchema';
import { z } from 'zod';

export type IAccountCategory = GraphqlView<
  NonNullable<AccountingAccountCategoryDetailQuery['accountCategoryDetail']>
>;

export type TAccountCategoryForm = z.infer<typeof accountCategorySchema>;
