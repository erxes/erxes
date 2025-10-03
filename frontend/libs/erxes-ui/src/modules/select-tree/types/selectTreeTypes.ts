export interface ISelectTreeContext {
  id: string;
  // hideChildren: string[];
  // setHideChildren: (hideChildren: string[]) => void;
  ordered?: boolean;
}

export interface ISelectTreeItem {
  _id: string;
  name: string;
  order: string;
  hasChildren: boolean;
  selected?: boolean;
}
