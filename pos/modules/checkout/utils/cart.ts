interface OrderItem {
  _id: string;
  productName?: string;
  count: number;
  itemIds?: string[];
  unitPrice?: number;
}

export function combineCartItems(
  items: OrderItem[],
  handlePriceMismatch?: (productName: string, unitPrice: number | undefined) => void
): OrderItem[] {
  if (!items || items.length === 0) {
    return [];
  }

  const combinedItems: Map<string, OrderItem> = new Map();

  for (const item of items) {
    const { productName, _id, count, unitPrice } = item;

    if (!productName || count <= 0) {
      continue;
    }

    const itemCount = Math.max(0, count); 

    if (combinedItems.has(productName)) {
      const existing = combinedItems.get(productName)!;

      if (existing.unitPrice !== unitPrice) {
        handlePriceMismatch?.(productName, unitPrice);
      }
      existing.count += itemCount;
      existing.itemIds = existing.itemIds || [existing._id];
      existing.itemIds.push(_id);
    } else {
      combinedItems.set(productName, {
        ...item,
        count: itemCount,
        itemIds: [_id],
      });
    }
  }

  return Array.from(combinedItems.values());
}
