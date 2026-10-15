import type { AccountingVatRowsQuery } from '~/gql/graphql';
import type { GraphqlView } from '@/utils/graphql';
import { z } from 'zod';
import { vatFormSchema } from '../constants/vatFormSchema';

export type IVatRow = GraphqlView<
  NonNullable<NonNullable<AccountingVatRowsQuery['vatRows']>[number]>
>;

export enum VatKind {
  NORMAL = 'normal',
  FORMULA = 'formula',
  TITLE = 'title',
  HIDDEN = 'hidden',
}

export const VAT_KIND_LABELS = {
  [VatKind.NORMAL]: 'standard',
  [VatKind.FORMULA]: 'formula',
  [VatKind.TITLE]: 'title',
  [VatKind.HIDDEN]: 'hidden',
};

export enum VatStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
}

export const VAT_STATUS_LABELS = {
  [VatStatus.ACTIVE]: 'active',
  [VatStatus.DELETED]: 'deleted',
};

export type TVatRowForm = z.infer<typeof vatFormSchema>;
