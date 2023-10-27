export type CalculatedRule = {
  passed: boolean;
  type: string;
  value: number;
  bonusProducts: string[];
};

export type OrderItem = {
  itemId: string;
  productId: string;
  quantity: number;
  price: number;
  manufacturedDate: string;
};
