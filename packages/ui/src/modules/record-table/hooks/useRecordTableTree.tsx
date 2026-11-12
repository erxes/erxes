import { useContext } from 'react';
import { collapsedOrders, isUnderCollapsed, toggleCollapse } from 'erxes-ui/lib/tree-collapse';
import { RecordTableTreeContext } from '../contexts/RecordTableTreeContext';

/** Collapse state for the tree row at `order`. */
export const useRecordTableTree = (order: string | undefined) => {
  const context = useContext(RecordTableTreeContext);

  if (!context) {
    throw new Error('useRecordTableTree must be used within a RecordTableTree');
  }

  const { ordered, length, collapse, setCollapse } = context;
  const hidden = collapsedOrders(collapse, length);

  return {
    toggleHideChildren: (parent: string) => setCollapse(toggleCollapse(hidden, parent, length)),
    ordered,
    isHiddenByParent: isUnderCollapsed(hidden, order),
    isHidden: order !== undefined && hidden.includes(order),
  };
};
