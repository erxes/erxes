import { ColumnDef } from '@tanstack/table-core';
import type { TFunction } from 'i18next';
import {
  amountColumn,
  cityTaxColumn,
  counterColumn,
  dateColumn,
  vatColumn,
} from '~/modules/ebarimt/put-response/components/columnDefinitions';
import { duplicatedMoreColumn } from '~/modules/ebarimt/put-response/put-responses-duplicated/components/DuplicatedMoreColumn';
import { IDuplicated } from '~/modules/ebarimt/put-response/put-responses-duplicated/types/DuplicatedType';

export const DuplicatedColumns = (t: TFunction): ColumnDef<IDuplicated>[] => [
  duplicatedMoreColumn,
  dateColumn(t) as ColumnDef<IDuplicated>,
  counterColumn(t) as ColumnDef<IDuplicated>,
  cityTaxColumn(t) as ColumnDef<IDuplicated>,
  vatColumn(t) as ColumnDef<IDuplicated>,
  amountColumn(t) as ColumnDef<IDuplicated>,
];
