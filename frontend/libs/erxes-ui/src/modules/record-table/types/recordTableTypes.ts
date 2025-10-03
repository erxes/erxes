import { Table } from '@tanstack/react-table';

export interface IRecordTableContext {
  table: Table<any>;
  handleReachedBottom?: () => void;
}
