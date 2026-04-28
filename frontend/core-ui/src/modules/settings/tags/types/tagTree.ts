import { ITag } from 'ui-modules';

export type DraftKind = 'group' | 'tag' | 'child-tag';

export type DraftState = {
  kind: DraftKind;
  parentId?: string;
  name: string;
  description: string;
  touched: boolean;
  colorCode: string;
};

export type VisibleRow =
  | { rowType: 'group'; tag: ITag; depth: 0; isContext?: false }
  | { rowType: 'tag'; tag: ITag; depth: 0; isContext?: false }
  | {
      rowType: 'child-tag';
      tag: ITag;
      depth: 1;
      parentId: string;
      isContext?: boolean;
    }
  | { rowType: 'context-group'; tag: ITag; depth: 0; isContext: true }
  | { rowType: 'draft'; draft: DraftState; depth: number };

export type SelectionCapability = {
  canDelete: boolean;
  canMove: boolean;
  moveDisabledReason?: string;
};

export type ActiveFilter = 'all' | 'groups' | 'standalone' | 'child';
