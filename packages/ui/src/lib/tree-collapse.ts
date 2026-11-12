/**
 * Collapsed rows of an ordered tree. A row's order is its path ("a/b/c"), so a child's order
 * starts with its parent's. The collapse holds for the row count it was made at: when the rows
 * change, the tree opens again.
 */
export interface TreeCollapse {
  rowCount?: number;
  orders: string[];
}

/** The collapsed orders that still apply at `rowCount`. */
export const collapsedOrders = (collapse: TreeCollapse, rowCount: number | undefined) =>
  collapse.rowCount === rowCount ? collapse.orders : [];

/** Collapses `order` when it is open, opens it when it is collapsed. */
export const toggleCollapse = (
  orders: string[],
  order: string,
  rowCount: number | undefined,
): TreeCollapse => ({
  rowCount,
  orders: orders.includes(order) ? orders.filter((other) => other !== order) : [...orders, order],
});

/** Whether a collapsed ancestor hides the row at `order`. */
export const isUnderCollapsed = (orders: string[], order: string | undefined) =>
  order !== undefined &&
  orders.some((parent) => order.startsWith(parent) && order.length > parent.length);
