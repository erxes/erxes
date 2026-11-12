import type { TreeCollapse } from 'erxes-ui/lib/tree-collapse';

export interface ISelectTreeContext {
  ordered?: boolean;
  /** The option count; collapsed options open again when it changes. */
  length?: number;
  collapse: TreeCollapse;
  setCollapse: (collapse: TreeCollapse) => void;
}

export interface ISelectTreeItem {
  _id: string;
  name: string;
  order: string;
  hasChildren: boolean;
  selected?: boolean;
}
