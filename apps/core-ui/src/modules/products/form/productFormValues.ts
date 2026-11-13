import { Currency, CustomValue, type Product, ProductKind } from '@erxes/core-contract';
import { z } from 'zod';
import { amountStep, fromAmountInput, toAmountInput } from '~/lib/money';

type Translate = (key: string, defaultValue: string) => string;

const MAX_SIZE = 100_000_000;

/** A typed price (empty is free) that has no more decimals than the currency. */
const isPrice = (text: string, currency: string) => {
  const value = Number(text || '0');

  return (
    Number.isFinite(value) &&
    value >= 0 &&
    Math.abs(value / amountStep(currency) - fromAmountInput(text || '0', currency)) < 1e-6
  );
};

/** What the product sheet edits: text as typed, converted on save (`productInput`). */
export const productFormSchema = (t: Translate) => {
  const size = z
    .string()
    .trim()
    .refine(
      (text) => !text || (/^\d+$/.test(text) && Number(text) <= MAX_SIZE),
      t('form.whole-number', 'Enter a whole number'),
    );

  return z
    .object({
      kind: ProductKind,
      name: z
        .string()
        .trim()
        .min(1, t('form.name-required', 'Enter a name'))
        .max(200, t('form.too-long', 'Too long')),
      code: z.string().trim().max(100, t('form.too-long', 'Too long')),
      barcode: z.string().trim().max(100, t('form.too-long', 'Too long')),
      categoryId: z.string().nullable(),
      description: z.string().trim().max(10_000, t('form.too-long', 'Too long')),
      unit: z
        .string()
        .trim()
        .min(1, t('form.unit-required', 'Enter a unit, like pcs or kg'))
        .max(20, t('form.too-long', 'Too long')),
      price: z.string().trim(),
      currency: z
        .string()
        .trim()
        .refine(
          (code) => Currency.safeParse(code).success,
          t('form.currency-invalid', 'A currency code, like MNT or USD'),
        ),
      imageIds: z.array(z.string()).max(20, t('form.too-many-images', 'Up to 20 images')),
      weightGrams: size,
      lengthMm: size,
      widthMm: size,
      heightMm: size,
      plugins: z.array(z.string()),
      /** Changed custom field values only; `null` clears one. */
      customFields: z.record(CustomValue.nullable()),
    })
    .superRefine((values, context) => {
      if (Currency.safeParse(values.currency).success && !isPrice(values.price, values.currency)) {
        context.addIssue({
          code: 'custom',
          path: ['price'],
          message: t('form.price-invalid', 'Enter a price, like 12.50'),
        });
      }
    });
};

export type ProductFormValues = z.infer<ReturnType<typeof productFormSchema>>;

const sizeText = (value: number | null | undefined) =>
  value === null || value === undefined ? '' : String(value);

/** The form's starting values: the product's, or a new one's in the organisation's currency. */
export const productFormValues = (
  product: Product | undefined,
  currency: string,
): ProductFormValues => ({
  kind: product?.kind ?? 'goods',
  name: product?.name ?? '',
  code: product?.code ?? '',
  barcode: product?.barcode ?? '',
  categoryId: product?.categoryId ?? null,
  description: product?.description ?? '',
  unit: product?.unit ?? 'pcs',
  price: product ? toAmountInput(product.price, product.currency) : '',
  currency: product?.currency ?? currency,
  imageIds: product?.imageIds ?? [],
  weightGrams: sizeText(product?.weightGrams),
  lengthMm: sizeText(product?.lengthMm),
  widthMm: sizeText(product?.widthMm),
  heightMm: sizeText(product?.heightMm),
  plugins: product?.plugins ?? [],
  customFields: {},
});

const orNull = (text: string) => text || null;

const sizeOf = (text: string) => (text ? Number(text) : null);

/** The create or update input for validated form values. */
export const productInput = (values: ProductFormValues) => {
  const { currency } = values;

  return {
    kind: values.kind,
    name: values.name,
    code: orNull(values.code),
    barcode: orNull(values.barcode),
    categoryId: values.categoryId,
    description: orNull(values.description),
    unit: values.unit,
    price: fromAmountInput(values.price || '0', currency),
    currency,
    imageIds: values.imageIds,
    weightGrams: sizeOf(values.weightGrams),
    lengthMm: sizeOf(values.lengthMm),
    widthMm: sizeOf(values.widthMm),
    heightMm: sizeOf(values.heightMm),
    plugins: values.plugins,
    customFields: values.customFields,
  };
};
