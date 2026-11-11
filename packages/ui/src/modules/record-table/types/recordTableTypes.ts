import { Table } from '@tanstack/react-table';

export interface IRecordTableContext {
  table: Table<any>;
  handleReachedBottom?: () => void;
  columnSelectorOpen: boolean;
  setColumnSelectorOpen: (open: boolean) => void;
}
