export type IPosOrdersBySubs = ReturnType<
  typeof import('../../utils/posOrderJson').toPosSubscriptionRow
>;
