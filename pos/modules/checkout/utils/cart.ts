interface OrderItem {
    _id: string;
    productName?: string;
    count: number;
    itemIds?: string[];
    unitPrice?: number;
  }
  export function combineCartItems(items: OrderItem[]): OrderItem[] {
    if (!items?.length) return [];
    const combinedItems: { [key: string]: OrderItem } = {};
    items.forEach((item) => {
      const productName = item.productName;
      if (!productName) return;
      const count = Number(item.count) || 0;
      if (combinedItems[productName]) {
        const existing = combinedItems[productName];
        existing.count = (existing.count || 0) + count;
        existing.itemIds = existing.itemIds || [existing._id];
        existing.itemIds.push(item._id);
        existing._id = existing.itemIds.join(',');
      } else {
        combinedItems[productName] = {
          ...item,
          count,
          itemIds: [item._id]
        };
      }
    });
    return Object.values(combinedItems);
  }