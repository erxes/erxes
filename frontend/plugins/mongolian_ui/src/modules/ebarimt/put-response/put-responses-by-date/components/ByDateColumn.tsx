import { ColumnDef } from '@tanstack/table-core';
import type { TFunction } from 'i18next';
import {
  amountColumn,
  cityTaxColumn,
  counterColumn,
  dateColumn,
  vatColumn,
} from '~/modules/ebarimt/put-response/components/columnDefinitions';
import { byDateMoreColumn } from '~/modules/ebarimt/put-response/put-responses-by-date/components/ByDateMoreColumn';
import { IByDate } from '~/modules/ebarimt/put-response/put-responses-by-date/types/ByDateType';

export const ByDateColumns = (t: TFunction): ColumnDef<IByDate>[] => [
  byDateMoreColumn,
  dateColumn(t) as ColumnDef<IByDate>,
  counterColumn(t) as ColumnDef<IByDate>,
  cityTaxColumn(t) as ColumnDef<IByDate>,
  vatColumn(t) as ColumnDef<IByDate>,
  amountColumn(t) as ColumnDef<IByDate>,
];
