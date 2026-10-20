import { z } from 'zod';

export const dealSaleVoucherSchema = z
  .object({
    _id: z.string(),
    title: z.string(),
    voucherType: z.string(),
    kind: z.string().nullish(),
    value: z.number().nullish(),
    expiresAt: z.string().nullish(),
    status: z.string().nullish(),
    autoApplied: z.boolean(),
    applicable: z.boolean(),
    reason: z.string().nullish(),
  })
  .passthrough();

export type IDealSaleVoucher = z.infer<typeof dealSaleVoucherSchema>;
export const dealSaleVouchersSchema = z.object({
  vouchers: z.array(dealSaleVoucherSchema),
  settled: z.boolean(),
});

export interface IDealVoucherGroup {
  key: string;
  title: string;
  valueText: string;
  expiresAt?: string | null;
  count: number;
  // The one picking this group uses: the chosen one, else the first.
  voucherId: string;
  selected: boolean;
  autoApplied: boolean;
  applicable: boolean;
  reason?: string | null;
}

export const dealVoucherValueText = ({
  kind,
  value,
}: Pick<IDealSaleVoucher, 'kind' | 'value'>) => {
  if (!value) return '';
  return kind === 'percent' ? `${value}%` : `${value.toLocaleString()}₮`;
};

// Vouchers giving the same thing until the same day are one line.
export const groupDealVouchers = (
  vouchers: IDealSaleVoucher[],
  chosenId?: string | null,
): IDealVoucherGroup[] => {
  const groups = new Map<string, IDealVoucherGroup>();

  for (const voucher of vouchers) {
    const usable = voucher.applicable || voucher._id === chosenId;
    const key = [
      voucher.title,
      voucher.voucherType,
      voucher.kind,
      voucher.value,
      (voucher.expiresAt || '').slice(0, 10),
      usable ? '' : voucher.reason,
    ].join('|');
    const group = groups.get(key);

    if (!group) {
      groups.set(key, {
        key,
        title: voucher.title,
        valueText: dealVoucherValueText(voucher),
        expiresAt: voucher.expiresAt,
        count: 1,
        voucherId: voucher._id,
        selected: voucher._id === chosenId,
        autoApplied: voucher.autoApplied,
        applicable: usable,
        reason: usable ? null : voucher.reason,
      });
      continue;
    }

    group.count += 1;

    if (voucher._id === chosenId) {
      group.voucherId = voucher._id;
      group.selected = true;
    }
  }

  return Array.from(groups.values());
};
