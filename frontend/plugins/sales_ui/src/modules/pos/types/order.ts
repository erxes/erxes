export type IOrder = ReturnType<
  typeof import('../utils/posOrderJson').toPosOrderRow
>;
