import { createContext } from 'react';

/** Collapsed tree orders, for the row count they were collapsed at. */
export interface TreeCollapse {
  rowCount?: number;
  orders: string[];
}

export interface IRecordTableTreeContext {
  ordered?: boolean;
  /** The row count; collapsed rows open again when it changes. */
  length?: number;
  collapse: TreeCollapse;
  setCollapse: (collapse: TreeCollapse) => void;
}

export const RecordTableTreeContext = createContext<IRecordTableTreeContext | null>(null);
