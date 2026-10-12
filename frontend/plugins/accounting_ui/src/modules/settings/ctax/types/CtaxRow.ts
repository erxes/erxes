import type { AccountingCtaxRowsQuery } from '~/gql/graphql';
import type { GraphqlView } from '@/utils/graphql';
import { z } from 'zod';
import { ctaxFormSchema } from '../constants/ctaxFormSchema';

export type ICtaxRow = GraphqlView<
  NonNullable<NonNullable<AccountingCtaxRowsQuery['ctaxRows']>[number]>
>;

export enum CtaxKind {
  NORMAL = 'normal',
  FORMULA = 'formula',
  TITLE = 'title',
  HIDDEN = 'hidden',
}

export const CTAX_KIND_LABELS = {
  [CtaxKind.NORMAL]: 'standard',
  [CtaxKind.FORMULA]: 'formula',
  [CtaxKind.TITLE]: 'title',
  [CtaxKind.HIDDEN]: 'hidden',
};

export enum CtaxStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
}

export const CTAX_STATUS_LABELS = {
  [CtaxStatus.ACTIVE]: 'active',
  [CtaxStatus.DELETED]: 'deleted',
};

export type TCtaxRowForm = z.infer<typeof ctaxFormSchema>;
