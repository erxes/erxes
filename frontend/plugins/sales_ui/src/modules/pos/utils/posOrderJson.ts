import { z } from 'zod';
import type {
  PosOrderBySubscriptionsQuery,
  PosOrderCustomersQuery,
  PosOrderRecordsQuery,
  PosOrdersQuery,
  SalesPosOrderDetailQuery,
  SalesPosItemDetailQuery,
  QueryQuery,
} from '~/gql/graphql';
import { isDefined } from 'erxes-ui';
import { hasId } from './posJson';

const text = z.string().nullish();
const numeric = z.union([z.number(), z.string()]).nullish();
const category = z.object({ code: text, name: text }).passthrough().nullish();
export const posOrderItemSchema = z
  .object({
    productName: text,
    productCode: text,
    productCategory: category,
    productCategoryCode: text,
    productCategoryName: text,
    barcodes: z.array(z.string().nullable()).nullish(),
    product: z
      .object({
        code: text,
        name: text,
        barcodes: z.array(z.string().nullable()).nullish(),
        productCategory: category,
      })
      .passthrough()
      .nullish(),
    count: numeric,
    unitPrice: numeric,
    amount: numeric,
    discountAmount: numeric,
    discountPercent: numeric,
  })
  .passthrough();
export type PosOrderItem = z.infer<typeof posOrderItemSchema>;
export const posPaidAmountSchema = z
  .object({
    type: text,
    amount: numeric.transform((value) => Number(value) || 0),
    title: text,
  })
  .passthrough();
export type PosPaidAmount = z.infer<typeof posPaidAmountSchema>;
export const parsePosPaidAmounts = (value: unknown): PosPaidAmount[] => {
  if (value == null) return [];
  if (Array.isArray(value))
    return z
      .array(posPaidAmountSchema.nullable())
      .parse(value)
      .filter(isDefined);
  const amounts = z.record(numeric).parse(value);
  return Object.entries(amounts).map(([type, amount]) => ({
    type,
    amount: Number(amount) || 0,
  }));
};

// Untyped legacy payments have no editable form field but still belong to the order.
export const preserveUntypedPosPayments = (
  edited: PosPaidAmount[],
  original: PosPaidAmount[] | undefined,
): PosPaidAmount[] => [
  ...edited,
  ...(original ?? []).filter(({ type }) => !type),
];

const locationSchema = z
  .object({ order: text, title: text })
  .passthrough()
  .nullish();
const putResponsesSchema = z.array(
  z.object({ createdAt: text }).passthrough().nullable(),
);

export const toPosOrderRow = (
  order: NonNullable<NonNullable<PosOrdersQuery['posOrders']>[number]> & {
    _id: string;
  },
) => ({
  ...order,
  paidAmounts: parsePosPaidAmounts(order.paidAmounts),
});

export const toPosItemRow = (
  order: NonNullable<
    NonNullable<PosOrderRecordsQuery['posOrderRecords']>[number]
  > & { _id: string },
) => ({
  ...order,
  items: posOrderItemSchema.nullish().parse(order.items),
  branch: locationSchema.parse(order.branch),
  department: locationSchema.parse(order.department),
  paidAmounts: parsePosPaidAmounts(order.paidAmounts),
});

export const toPosOrderDetail = <
  T extends
    | NonNullable<SalesPosOrderDetailQuery['posOrderDetail']>
    | NonNullable<SalesPosItemDetailQuery['posOrderDetail']>,
>(
  order: T,
) => ({
  ...order,
  items: z
    .array(posOrderItemSchema.nullable())
    .parse(order.items ?? [])
    .filter(isDefined),
  paidAmounts: parsePosPaidAmounts(order.paidAmounts),
  putResponses: putResponsesSchema
    .parse(order.putResponses ?? [])
    .filter(isDefined),
  deal: z
    .object({ searchText: text })
    .passthrough()
    .nullish()
    .parse(order.deal),
});

const customerSchema = z
  .object({
    _id: text,
    state: text,
    primaryName: text,
    firstName: text,
    lastName: text,
    primaryEmail: text,
    primaryPhone: text,
    code: text,
  })
  .passthrough()
  .nullish();
export const toPosCustomerRow = (
  row: NonNullable<
    NonNullable<PosOrderCustomersQuery['posOrderCustomers']>[number]
  > & { _id: string },
) => ({
  ...row,
  customerDetail: customerSchema.parse(row.customerDetail),
  orders: (row.orders ?? []).filter(hasId),
});

export const posSummarySchema = z
  .object({
    amounts: z
      .array(
        z
          .object({
            paidDate: text,
            count: numeric,
            cashAmount: numeric,
            mobileAmount: numeric,
            totalAmount: numeric,
            finalAmount: numeric,
            invoice: numeric,
            qpayAmount: numeric,
          })
          .passthrough(),
      )
      .optional(),
    columns: z.record(z.string().nullish()).optional(),
  })
  .passthrough();

export const mergePosSummaryPages = (
  previous: QueryQuery,
  next: QueryQuery | undefined,
): QueryQuery => {
  const nextParsed = posSummarySchema.safeParse(
    next?.posOrdersGroupSummary ?? {},
  );
  const previousParsed = posSummarySchema.safeParse(
    previous.posOrdersGroupSummary ?? {},
  );
  if (
    !nextParsed.success ||
    !previousParsed.success ||
    !nextParsed.data.amounts
  ) {
    return previous;
  }
  return {
    ...previous,
    posOrdersGroupSummary: {
      amounts: [
        ...(previousParsed.data.amounts ?? []),
        ...nextParsed.data.amounts,
      ],
      columns: nextParsed.data.columns || previousParsed.data.columns,
    },
  };
};

export const readPosCount = (value: unknown): number =>
  typeof value === 'number' ? value : 0;

export const toPosSubscriptionRow = (
  row: NonNullable<
    NonNullable<PosOrderBySubscriptionsQuery['posOrderBySubscriptions']>[number]
  > & { _id: string },
) => ({ ...row, customer: customerSchema.parse(row.customer) });

// Keep malformed JSON visible as a query error instead of crashing the report.
export const readPosData = <T>(read: () => T): { value?: T; error?: Error } => {
  try {
    return { value: read() };
  } catch (cause) {
    return { error: cause instanceof Error ? cause : new Error(String(cause)) };
  }
};
