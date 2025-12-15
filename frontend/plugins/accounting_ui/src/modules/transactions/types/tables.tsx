import { ColumnDef, RowData } from '@tanstack/react-table';

export type ExtendedColumnDef<TData extends RowData, TValue = unknown> =
  ColumnDef<TData, TValue> & {
    colOrder?: number;
  };
