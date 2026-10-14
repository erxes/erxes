import { z } from 'zod';
import { VOUCHER_VALIDITY_UNITS } from '~/modules/loyalties/settings/voucher/utils/voucherTerm';

export const issueVoucherActionConfigFormSchema = z.object({
  attribution: z.string().min(1, 'Select who receives the voucher'),
  voucherCampaignId: z.string().min(1, 'Select a voucher campaign'),
  // Left out, the campaign's own validity applies.
  customRule: z
    .object({
      count: z.number().int().min(1, 'At least one'),
      unit: z.enum(VOUCHER_VALIDITY_UNITS),
    })
    .optional(),
});

export const awardSpinActionConfigFormSchema = z.object({
  attribution: z.string().min(1, 'Select who receives the spin'),
  spinCampaignId: z.string().min(1, 'Select a spin campaign'),
});

export type TIssueVoucherActionConfigForm = z.infer<
  typeof issueVoucherActionConfigFormSchema
>;

export type TAwardSpinActionConfigForm = z.infer<
  typeof awardSpinActionConfigFormSchema
>;

export type TLoyaltyActionConfigForm =
  | TIssueVoucherActionConfigForm
  | TAwardSpinActionConfigForm;
