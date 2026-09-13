import { IProductData } from 'ui-modules';

export type DiscountInfo = {
  type: string;
  title?: string;
  amount?: number;
  percent?: number;
};

export type ProductDataWithDiscountInfos = IProductData & {
  discountInfos?: DiscountInfo[];
};

const HAND_TYPE = 'hand';

const finiteNumber = (value?: number) =>
  Number.isFinite(Number(value)) ? Number(value) : 0;

const fixNum = (value: number, precision = 2) =>
  Number(value.toFixed(precision));

export const productBaseAmount = (product: IProductData) =>
  finiteNumber(product.unitPrice) * finiteNumber(product.quantity);

export const nonHandDiscountAmount = (product: ProductDataWithDiscountInfos) =>
  (product.discountInfos || [])
    .filter((info) => info.type !== HAND_TYPE)
    .reduce((sum, info) => sum + finiteNumber(info.amount), 0);

const setHandDiscount = (
  product: ProductDataWithDiscountInfos,
  handAmount: number,
) => {
  const baseAmount = productBaseAmount(product);
  const normalizedHandAmount = fixNum(handAmount);
  const nonHandInfos = (product.discountInfos || []).filter(
    (info) => info.type !== HAND_TYPE,
  );

  return {
    ...product,
    discountInfos: [
      ...nonHandInfos,
      ...(normalizedHandAmount !== 0
        ? [
            {
              type: HAND_TYPE,
              title: 'Manual discount',
              amount: normalizedHandAmount,
              percent:
                baseAmount > 0
                  ? fixNum((normalizedHandAmount * 100) / baseAmount, 8)
                  : 0,
            },
          ]
        : []),
    ],
  };
};

export const recalculateProductDiscount = (
  product: ProductDataWithDiscountInfos,
) => {
  const baseAmount = productBaseAmount(product);
  const discount = fixNum(
    (product.discountInfos || []).reduce(
      (sum, info) => sum + finiteNumber(info.amount),
      0,
    ),
  );
  const taxPercent = finiteNumber(product.taxPercent);
  const taxableAmount = baseAmount - discount;
  const tax = taxPercent ? fixNum((taxableAmount * taxPercent) / 100) : 0;

  return {
    ...product,
    discount,
    discountPercent:
      baseAmount > 0 ? fixNum((discount * 100) / baseAmount, 8) : 0,
    tax,
    amount: fixNum(taxableAmount + tax),
  };
};

export const applyRowDiscount = (
  product: IProductData,
  targetDiscountAmount: number,
) => {
  const productWithInfo = product as ProductDataWithDiscountInfos;
  const handAmount =
    fixNum(targetDiscountAmount) - nonHandDiscountAmount(productWithInfo);

  return recalculateProductDiscount(
    setHandDiscount(productWithInfo, handAmount),
  );
};

export const applyFooterDiscountPercent = (
  product: IProductData,
  percent: number,
) => {
  const productWithInfo = product as ProductDataWithDiscountInfos;
  const baseAmount = productBaseAmount(productWithInfo);
  const extraAmount = fixNum((baseAmount * percent) / 100);

  return recalculateProductDiscount(
    setHandDiscount(productWithInfo, extraAmount),
  );
};

export const applyFooterDiscountAmount = (
  product: IProductData,
  totalBaseAmount: number,
  amount: number,
) => {
  const productWithInfo = product as ProductDataWithDiscountInfos;
  const baseAmount = productBaseAmount(productWithInfo);
  const extraAmount =
    totalBaseAmount > 0 ? fixNum((baseAmount / totalBaseAmount) * amount) : 0;

  return recalculateProductDiscount(
    setHandDiscount(productWithInfo, extraAmount),
  );
};
