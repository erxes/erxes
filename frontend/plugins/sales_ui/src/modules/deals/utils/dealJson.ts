import { z } from 'zod';
import type { DealDetailQuery } from '~/gql/graphql';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const optionalNumber = z.number().finite().nullish();
const optionalString = z.string().nullish();

// These fields are JSON in the public API. Preserve extra keys on round trips;
// a malformed editable value must fail validation, never become an empty save.
export const dealProductSchema = z
  .object({
    _id: z.string(),
    name: optionalString,
    code: optionalString,
    type: optionalString,
    unitPrice: optionalNumber,
    categoryId: optionalString,
    category: z
      .object({ _id: optionalString, name: optionalString })
      .passthrough()
      .nullish(),
    vendor: z
      .object({ _id: optionalString, primaryName: optionalString })
      .passthrough()
      .nullish(),
    uom: optionalString,
    subUoms: z
      .array(
        z
          .object({
            uom: optionalString,
            ratio: z.union([z.number(), z.string()]).nullish(),
          })
          .passthrough()
          .nullable(),
      )
      .transform((items) => items.filter((item) => item !== null))
      .nullish(),
    tagIds: z
      .array(z.string().nullable())
      .transform((ids) => ids.filter((id) => id !== null))
      .nullish(),
    branchId: optionalString,
    departmentId: optionalString,
  })
  .passthrough();

export const dealProductDataSchema = z
  .object({
    _id: optionalString,
    productId: optionalString,
    product: dealProductSchema
      .nullish()
      .transform((value) => value ?? undefined),
    uom: optionalString,
    uomInfo: z
      .object({
        uom: optionalString,
        ratio: optionalNumber,
        unitPrice: optionalNumber,
        quantity: optionalNumber,
      })
      .passthrough()
      .nullish(),
    currency: optionalString,
    quantity: optionalNumber,
    unitPrice: optionalNumber,
    globalUnitPrice: optionalNumber,
    unitPricePercent: optionalNumber,
    taxPercent: optionalNumber,
    tax: optionalNumber,
    vatPercent: optionalNumber,
    discountPercent: optionalNumber,
    discount: optionalNumber,
    amount: optionalNumber,
    maxQuantity: optionalNumber,
    bonusCount: optionalNumber,
    tickUsed: z.boolean().nullish(),
    isVatApplied: z.boolean().nullish(),
    assignUserId: optionalString,
    assignedUserId: optionalString,
    branchId: optionalString,
    departmentId: optionalString,
    discountInfos: z
      .array(
        z
          .object({
            type: optionalString,
            title: optionalString,
            amount: optionalNumber,
            percent: optionalNumber,
          })
          .passthrough(),
      )
      .nullish(),
  })
  .passthrough();

export type DealProduct = Omit<
  Pick<z.infer<typeof dealProductSchema>, keyof typeof dealProductSchema.shape>,
  'category' | 'vendor'
> & {
  category?: Pick<
    NonNullable<z.infer<typeof dealProductSchema>['category']>,
    '_id' | 'name'
  > | null;
  vendor?: Pick<
    NonNullable<z.infer<typeof dealProductSchema>['vendor']>,
    '_id' | 'primaryName'
  > | null;
};
export type DealProductData = Omit<
  Pick<
    z.infer<typeof dealProductDataSchema>,
    keyof typeof dealProductDataSchema.shape
  >,
  'product'
> & { product?: DealProduct };
export const dealProductsSchema = z.array(dealProductDataSchema);
export const parseDealProducts = (value: unknown): DealProductData[] =>
  dealProductsSchema.parse(value ?? []);

const paymentDataSchema = z
  .object({
    currency: optionalString,
    amount: optionalNumber,
    info: z.unknown(),
  })
  .passthrough();

export const paymentsDataSchema = z
  .record(z.union([paymentDataSchema, z.number().finite()]))
  .superRefine((payments, ctx) => {
    for (const [type, payment] of Object.entries(payments)) {
      if (typeof payment === 'number' && type !== 'totalAmount') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [type],
          message: 'Expected a payment object',
        });
      }
    }
  });
export type DealPaymentsData = z.infer<typeof paymentsDataSchema>;

// Legacy totalAmount is summary metadata, not an editable payment entry.
export const readDealPayment = (
  payments: DealPaymentsData,
  type: string,
): z.infer<typeof paymentDataSchema> | undefined => {
  const payment = payments[type];
  return typeof payment === 'number' ? undefined : payment;
};

export const paymentTypesSchema = z.array(
  z
    .object({
      _id: optionalString.transform((value) => value ?? undefined),
      type: z.string(),
      title: optionalString.transform((value) => value ?? ''),
      icon: optionalString.transform((value) => value ?? ''),
      config: z.unknown().transform((value) => {
        if (value == null) return undefined;
        if (typeof value === 'string') return value;
        return JSON.stringify(value);
      }),
      scoreCampaignId: optionalString.transform((value) => value ?? undefined),
    })
    .passthrough(),
);

export const parseDealProductMutation = (value: unknown): DealProductData[] =>
  z.object({ productsData: dealProductsSchema }).parse(value).productsData;

const extraDataSchema = z
  .object({ voucherId: optionalString, couponCode: optionalString })
  .passthrough();
const mobileAmountsSchema = z.array(
  z.object({ _id: optionalString, amount: optionalNumber }).passthrough(),
);

export const toDealDetail = (
  deal: NonNullable<DealDetailQuery['dealDetail']>,
) => ({
  ...deal,
  propertiesData: z.record(z.unknown()).parse(deal.propertiesData ?? {}),
  productsData: parseDealProducts(deal.productsData),
  products: z
    .array(dealProductSchema)
    .parse(deal.products?.filter((product) => product !== null) ?? []),
  paymentsData: paymentsDataSchema.parse(deal.paymentsData ?? {}),
  mobileAmounts: mobileAmountsSchema.parse(deal.mobileAmounts ?? []),
  extraData: extraDataSchema.parse(deal.extraData ?? {}),
  pipeline: deal.pipeline
    ? {
        ...deal.pipeline,
        paymentTypes: paymentTypesSchema.parse(
          deal.pipeline.paymentTypes ?? [],
        ),
      }
    : null,
});

export const readCurrencyAmounts = (value: unknown): Record<string, number> =>
  isRecord(value)
    ? Object.fromEntries(
        Object.entries(value).filter(
          (entry): entry is [string, number] =>
            typeof entry[1] === 'number' && Number.isFinite(entry[1]),
        ),
      )
    : {};
