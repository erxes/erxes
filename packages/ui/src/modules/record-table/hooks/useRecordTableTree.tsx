import { useContext } from 'react';
import { RecordTableTreeContext } from '../contexts/RecordTableTreeContext';

/** Collapse state for the tree row at `order` ("a/b/c"; a child's order starts with its parent's). */
export const useRecordTableTree = (order: string | undefined) => {
  const context = useContext(RecordTableTreeContext);

  if (!context) {
    throw new Error('useRecordTableTree must be used within a RecordTableTree');
  }

  const { ordered, length, collapse, setCollapse } = context;
  const hidden = collapse.rowCount === length ? collapse.orders : [];

  const toggleHideChildren = (parent: string) => {
    setCollapse({
      rowCount: length,
      orders: hidden.includes(parent)
        ? hidden.filter((other) => other !== parent)
        : [...hidden, parent],
    });
  };

  const isHiddenByParent =
    order !== undefined &&
    hidden.some((parent) => order.startsWith(parent) && order.length > parent.length);

  return {
    toggleHideChildren,
    ordered,
    isHiddenByParent,
    isHidden: order !== undefined && hidden.includes(order),
  };
};
