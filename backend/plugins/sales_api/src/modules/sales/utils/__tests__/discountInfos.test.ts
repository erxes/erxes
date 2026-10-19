import { applyDiscountInfo, dropDiscountInfo } from '../discountInfos';
import type { IProductData } from '../../@types/deal';

jest.mock('erxes-api-shared/utils', () => ({
  fixNum: (value: number, p = 4) => Number(Number(value).toFixed(p)),
}));

// A line saved with a 1% voucher, as the deal detail sends it back.
const voucherLine = (): IProductData => ({
  productId: 'product',
  uom: 'pcs',
  currency: 'MNT',
  quantity: 1,
  globalUnitPrice: 100_000,
  unitPricePercent: 100,
  unitPrice: 100_000,
  discount: 1_000,
  discountPercent: 1,
  amount: 99_000,
  discountInfos: [{ type: 'voucher', amount: 1_000, percent: 1 }],
});

describe('dropDiscountInfo', () => {
  it('takes the discount off with its info', () => {
    const line = voucherLine();

    dropDiscountInfo(line, 'voucher');

    expect(line.discountInfos).toEqual([]);
    expect(line.discount).toBe(0);
    expect(line.amount).toBe(100_000);
  });

  it('never turns the dropped discount into a manual one when restated', () => {
    const line = voucherLine();

    dropDiscountInfo(line, 'voucher');
    applyDiscountInfo(line, { type: 'voucher', amount: 21_000, percent: 21 });

    expect(line.discountInfos?.map(({ type }) => type)).toEqual(['voucher']);
    expect(line.amount).toBe(79_000);
  });

  it('keeps a manual discount', () => {
    const line = voucherLine();
    line.discount = 3_000;
    line.discountInfos = [
      { type: 'voucher', amount: 1_000, percent: 1 },
      { type: 'hand', amount: 2_000, percent: 2 },
    ];

    dropDiscountInfo(line, 'voucher');

    expect(line.discountInfos).toEqual([
      { type: 'hand', amount: 2_000, percent: 2 },
    ]);
    expect(line.amount).toBe(98_000);
  });
});
