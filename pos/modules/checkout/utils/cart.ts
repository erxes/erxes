import { OrderItem } from "@/types/order.types";

export function combineCartItems(items: OrderItem[]): OrderItem[] {
  const combinedItems: { [key: string]: OrderItem } = {};

  items.forEach((item) => {
    if (item.productName) {
      if (combinedItems[item.productName]) {
        combinedItems[item.productName].count += item.count;
        combinedItems[item.productName]._id += `,${item._id}`;
      } else {
        combinedItems[item.productName] = { ...item };
      }
    }
  });

  return Object.values(combinedItems);
}