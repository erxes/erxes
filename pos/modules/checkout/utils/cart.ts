interface OrderItem {
  _id: string;
  productName?: string;
  count: number;
  itemIds?: string[];
  unitPrice?: number;
}

export function combineCartItems(items: OrderItem[]): OrderItem[] {
  if (!items?.length) {
    return [];
  }
  const combinedItems: { [key: string]: OrderItem } = {};
  items.forEach((item) => {
    const { productName, _id, count, unitPrice } = item;
    if (!productName) {
      return;
    }
    const itemCount = Number(count) || 0;
    if (combinedItems[productName]) {
      const existing = combinedItems[productName];
      if (existing.unitPrice !== unitPrice) {
        throw new Error(`Price mismatch for ${productName}`);
      }
      existing.count = (existing.count || 0) + itemCount;
      existing.itemIds = existing.itemIds || [existing._id];
      existing.itemIds.push(_id);
    } else {
      combinedItems[productName] = {
        ...item,
        count: itemCount,
        itemIds: [_id],
      };
    }
  });
  return Object.values(combinedItems);
}