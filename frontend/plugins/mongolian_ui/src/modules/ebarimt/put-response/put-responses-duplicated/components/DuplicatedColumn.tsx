import { ColumnDef } from '@tanstack/table-core';
import {
  amountColumn,
  cityTaxColumn,
  counterColumn,
  dateColumn,
  vatColumn,
} from '~/modules/ebarimt/put-response/components/columnDefinitions';
import { duplicatedMoreColumn } from '~/modules/ebarimt/put-response/put-responses-duplicated/components/DuplicatedMoreColumn';
import { IDuplicated } from '~/modules/ebarimt/put-response/put-responses-duplicated/types/DuplicatedType';

export const DuplicatedColumns: ColumnDef<IDuplicated>[] = [
  duplicatedMoreColumn,
  dateColumn as ColumnDef<IDuplicated>,
  counterColumn as ColumnDef<IDuplicated>,
  cityTaxColumn as ColumnDef<IDuplicated>,
  vatColumn as ColumnDef<IDuplicated>,
  amountColumn as ColumnDef<IDuplicated>,
];
