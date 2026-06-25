import { ColumnDef } from '@tanstack/table-core';
import {
  amountColumn,
  cityTaxColumn,
  counterColumn,
  dateColumn,
  vatColumn,
} from '~/modules/ebarimt/put-response/components/columnDefinitions';
import { byDateMoreColumn } from '~/modules/ebarimt/put-response/put-responses-by-date/components/ByDateMoreColumn';
import { IByDate } from '~/modules/ebarimt/put-response/put-responses-by-date/types/ByDateType';

export const ByDateColumns: ColumnDef<IByDate>[] = [
  byDateMoreColumn,
  dateColumn as ColumnDef<IByDate>,
  counterColumn as ColumnDef<IByDate>,
  cityTaxColumn as ColumnDef<IByDate>,
  vatColumn as ColumnDef<IByDate>,
  amountColumn as ColumnDef<IByDate>,
];
