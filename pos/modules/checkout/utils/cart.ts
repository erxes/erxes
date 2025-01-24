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
  if (!items?.length) {
    return [];
  }

  const combinedItems: Map<string, OrderItem> = new Map();

  for (const item of items) {
    const { productName, _id, count, unitPrice } = item;

    if (!productName || count <= 0) {
      continue;
    }

    if (combinedItems.has(productName)) {
      const existing = combinedItems.get(productName);
      if (!existing) {
        throw new Error(`Unexpected: Item ${productName} not found in map`);
      }

      if (unitPrice !== undefined && unitPrice <= 0) {
        throw new Error(`Invalid price for ${productName}: ${unitPrice}`);
      }

      if (existing.unitPrice !== unitPrice) {
        handlePriceMismatch?.(productName, unitPrice);
      }

      existing.count += count;
      existing.itemIds = existing.itemIds || [existing._id];
      existing.itemIds.push(_id);
    } else {
      combinedItems.set(productName, {
        ...item,
        count,
        itemIds: [_id],
      });
    }
  }

  return Array.from(combinedItems.values());
}