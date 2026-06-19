import { z } from 'zod';

export const issueVoucherActionConfigFormSchema = z.object({
  attribution: z.string().min(1, 'Select who receives the voucher'),
  voucherCampaignId: z.string().min(1, 'Select a voucher campaign'),
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
