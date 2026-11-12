import { collapsedOrders, isUnderCollapsed, toggleCollapse } from 'erxes-ui/lib/tree-collapse';
import { useSelectTreeContext } from 'erxes-ui/modules/select-tree/context/SelectTreeContext';

/** Collapse state for the tree option at `order`. */
export function useSelectTreeHide(order?: string) {
  const { length, collapse, setCollapse } = useSelectTreeContext();
  const hidden = collapsedOrders(collapse, length);

  return {
    toggleHideChildren: (parent: string) => setCollapse(toggleCollapse(hidden, parent, length)),
    isHidden: order !== undefined && hidden.includes(order),
    isHiddenByParent: isUnderCollapsed(hidden, order),
  };
}
