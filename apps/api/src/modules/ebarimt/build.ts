import type { EBARIMT_TAX_TYPES } from '@erxes/core-db/enums';
import type { EbarimtTaxRule, InvoiceLine, ebarimtSettings } from '@erxes/core-db';

// Builds the PosAPI 3.0 receipt for an invoice. Core keeps money in the
// smallest unit; PosAPI takes tögrög with two decimals, so amounts are
// divided by 100 only here.

type Settings = typeof ebarimtSettings.$inferSelect;

type TaxType = (typeof EBARIMT_TAX_TYPES)[number];

const toTugrik = (minor: number) => Math.round(minor) / 100;

/** A GS1 barcode (EAN-8, UPC, EAN-13, GTIN-14, SSCC) whose check digit adds up. */
const isGs1Barcode = (barcode: string) => {
  if (![8, 12, 13, 14, 18].includes(barcode.length) || !/^\d+$/.test(barcode)) return false;

  const digits = barcode.slice(0, -1).split('').toReversed().map(Number);
  const total = digits.reduce((sum, digit, index) => sum + digit * (index % 2 === 0 ? 3 : 1), 0);

  return (10 - (total % 10)) % 10 === Number(barcode.slice(-1));
};

/** Who the receipt is for. */
export interface Buyer {
  type: 'B2C_RECEIPT' | 'B2B_RECEIPT';
  customerTin: string | null;
  customerName: string | null;
  consumerNo: string | null;
}

/** What the builder reads about a core product. */
export interface ProductInfo {
  code: string | null;
  barcode: string | null;
  unit: string;
  /** The product's category and every category above it. */
  categoryPath: string[];
}

export interface BuildInput {
  /** The invoice's lines, cut down to what is still paid. */
  lines: InvoiceLine[];
  settings: Settings;
  products: Map<string, ProductInfo>;
  buyer: Buyer;
  /** When the sale was paid: an earlier month is reported in that month. */
  paidAt: Date;
  /** The bill this receipt replaces. */
  inactiveId: string | null;
  today?: Date;
}

/**
 * The invoice's lines for `amount` of its total (what is left after a
 * partial refund): each line's share, rounded, the last line taking the
 * rounding so they add up to `amount`.
 */
export const linesFor = (
  invoice: { amount: number; description: string; lines: InvoiceLine[] },
  amount: number,
): InvoiceLine[] => {
  const lines: InvoiceLine[] = invoice.lines.length
    ? invoice.lines
    : [
        {
          productId: null,
          name: invoice.description,
          quantity: 1,
          unitPrice: invoice.amount,
          amount: invoice.amount,
          plugin: null,
        },
      ];

  if (amount === invoice.amount) return lines;

  const ratio = amount / invoice.amount;
  let left = amount;

  return lines.map((line, index) => {
    const share = index === lines.length - 1 ? left : Math.round(line.amount * ratio);

    left -= share;

    return { ...line, amount: share, unitPrice: Math.round(share / line.quantity) };
  });
};

const ruleFor = (rules: EbarimtTaxRule[], productId: string | null, path: string[]) =>
  productId
    ? rules.find(
        (rule) =>
          rule.productIds.includes(productId) || rule.categoryIds.some((id) => path.includes(id)),
      )
    : undefined;

interface Item {
  line: InvoiceLine;
  product: ProductInfo | null;
  taxType: TaxType;
  taxCode: string | null;
  vat: number;
  cityTax: number;
}

/** PosAPI's tax type for each of an invoice line's tax categories. */
const TAX_TYPE_OF = {
  standard: 'VAT_ABLE',
  zero: 'VAT_ZERO',
  exempt: 'VAT_FREE',
  outside: 'NOT_SEND',
} as const satisfies Record<NonNullable<InvoiceLine['tax']>['category'], TaxType>;

/**
 * How the line is taxed: the organisation's rule for its product or
 * category first (the merchant's own setting), then what the plugin said
 * on the line, else VAT.
 */
const taxOf = (input: BuildInput, line: InvoiceLine, product: ProductInfo | null) => {
  const rule = ruleFor(input.settings.rules, line.productId, product?.categoryPath ?? []);

  if (rule) return { taxType: rule.taxType, taxCode: rule.taxCode };

  if (line.tax) return { taxType: TAX_TYPE_OF[line.tax.category], taxCode: line.tax.code ?? null };

  return { taxType: 'VAT_ABLE' as const, taxCode: null };
};

const itemOf = (input: BuildInput, line: InvoiceLine): Item => {
  const product = (line.productId && input.products.get(line.productId)) || null;
  const { taxType, taxCode } = taxOf(input, line, product);
  const taxed = taxType === 'VAT_ABLE';
  const vatPercent = taxed ? input.settings.vatPercent : 0;
  const cityTaxPercent = taxed ? input.settings.cityTaxPercent : 0;
  // Prices include the taxes: VAT is its share of the price.
  const whole = 100 + vatPercent + cityTaxPercent;

  return {
    line,
    product,
    taxType,
    taxCode,
    vat: Math.round((line.amount * vatPercent) / whole),
    cityTax: Math.round((line.amount * cityTaxPercent) / whole),
  };
};

const posItem = ({ line, product, taxCode, vat, cityTax }: Item, settings: Settings) => {
  const barcode = product?.barcode || line.barcode || '';

  return {
    name: product?.code ? `${product.code} - ${line.name}` : line.name,
    barCode: barcode,
    barCodeType: isGs1Barcode(barcode) ? 'GS1' : 'UNDEFINED',
    classificationCode: settings.classificationCode,
    ...(taxCode && { taxProductCode: taxCode }),
    measureUnit: product?.unit || 'ш',
    qty: line.quantity,
    unitPrice: toTugrik(line.unitPrice),
    totalBonus: 0,
    totalVAT: toTugrik(vat),
    totalCityTax: toTugrik(cityTax),
    totalAmount: toTugrik(line.amount),
    data: {},
  };
};

const sum = (items: Item[], pick: (item: Item) => number) =>
  items.reduce((total, item) => total + pick(item), 0);

/**
 * The receipt PosAPI takes and its totals in the smallest unit; null when
 * every line is left off (NOT_SEND) or nothing is paid. Paid through a
 * gateway, so the payment is non-cash (`PAYMENT_CARD`).
 */
export const buildReceipt = (input: BuildInput) => {
  const items = input.lines
    .filter((line) => line.amount > 0)
    .map((line) => itemOf(input, line))
    .filter((item) => item.taxType !== 'NOT_SEND');

  if (!items.length) return null;

  const { settings, buyer } = input;

  const totals = {
    totalAmount: sum(items, (item) => item.line.amount),
    totalVat: sum(items, (item) => item.vat),
    totalCityTax: sum(items, (item) => item.cityTax),
  };

  const today = input.today ?? new Date();

  const earlier =
    input.paidAt.getMonth() !== today.getMonth() ||
    input.paidAt.getFullYear() !== today.getFullYear();

  const byType = new Map<TaxType, Item[]>();

  for (const item of items) byType.set(item.taxType, [...(byType.get(item.taxType) ?? []), item]);

  return {
    totals,
    request: {
      totalAmount: toTugrik(totals.totalAmount),
      totalVAT: toTugrik(totals.totalVat),
      totalCityTax: toTugrik(totals.totalCityTax),
      districtCode: settings.districtCode,
      branchNo: settings.branchNo,
      merchantTin: settings.merchantTin,
      posNo: settings.posNo,
      type: buyer.type,
      ...(buyer.customerTin && { customerTin: buyer.customerTin }),
      ...(buyer.consumerNo && { consumerNo: buyer.consumerNo }),
      ...(earlier && { reportMonth: input.paidAt.toISOString().slice(0, 7) }),
      ...(input.inactiveId && { inactiveId: input.inactiveId }),
      data: {},
      receipts: [...byType].map(([taxType, group]) => ({
        merchantTin: settings.merchantTin,
        totalAmount: toTugrik(sum(group, (item) => item.line.amount)),
        totalVAT: toTugrik(sum(group, (item) => item.vat)),
        totalCityTax: toTugrik(sum(group, (item) => item.cityTax)),
        taxType,
        data: {},
        items: group.map((item) => posItem(item, settings)),
      })),
      payments: [
        {
          code: 'PAYMENT_CARD',
          exchangeCode: '',
          status: 'PAID',
          paidAmount: toTugrik(totals.totalAmount),
        },
      ],
    },
  };
};

export type BuiltReceipt = NonNullable<ReturnType<typeof buildReceipt>>;
