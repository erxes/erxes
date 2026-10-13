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
  manufacturedDate?: string;
  // Code of the core product condition the line is sold under, if any.
  conditionCode?: string;
};
