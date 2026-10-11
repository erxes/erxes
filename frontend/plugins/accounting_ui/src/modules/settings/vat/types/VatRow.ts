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
  [VatKind.NORMAL]: 'Энгийн',
  [VatKind.FORMULA]: 'Томьёо',
  [VatKind.TITLE]: 'Гарчиг',
  [VatKind.HIDDEN]: 'Нуусан',
};

export enum VatStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
}

export const VAT_STATUS_LABELS = {
  [VatStatus.ACTIVE]: 'Идэвхтэй',
  [VatStatus.DELETED]: 'Устгасан',
};

export type TVatRowForm = z.infer<typeof vatFormSchema>;
