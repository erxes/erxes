export type IPosOrdersByCustomer = ReturnType<
  typeof import('../../utils/posOrderJson').toPosCustomerRow
>;
