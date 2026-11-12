import { createContext } from 'react';
import type { TreeCollapse } from 'erxes-ui/lib/tree-collapse';

export interface IRecordTableTreeContext {
  ordered?: boolean;
  /** The row count; collapsed rows open again when it changes. */
  length?: number;
  collapse: TreeCollapse;
  setCollapse: (collapse: TreeCollapse) => void;
}

export const RecordTableTreeContext = createContext<IRecordTableTreeContext | null>(null);
