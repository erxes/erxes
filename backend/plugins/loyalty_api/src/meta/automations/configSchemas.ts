import { describeConfigField as described } from 'erxes-api-shared/core-modules';
import { z } from 'zod/v4';
import { VOUCHER_VALIDITY_UNITS } from '~/modules/voucher/services/voucherTerm';

/**
 * Config contracts of loyalty's automation actions: what each handler reads
 * or refuses, published to authors as configJsonSchema.
 */

const requiredText = (description: string) =>
  described(z.string().trim().min(1), description);

const attribution = requiredText(
  'Whose account it is: a placeholder naming the owner, e.g. {{ trigger.customerId }}.',
);

const ownerType = z.enum(['customer', 'company', 'user']).optional();

// Steps saved before attribution named their owners directly; with neither,
// the record the run is about receives it.
const legacyOwners = {
  ownerId: z.string().optional(),
  ownerIds: z.array(z.string()).optional(),
};

const optionalAttribution = described(
  z.string(),
  'Whose account it is: a placeholder naming the owner, e.g. {{ trigger.customerId }}; the record the run is about when absent.',
).optional();

export const issueVoucherActionConfigSchema = z.object({
  voucherCampaignId: requiredText('_id of the voucher campaign.'),
  attribution: optionalAttribution,
  ownerType,
  ...legacyOwners,
  customRule: described(
    z
      .object({
        count: z.number().int().min(1),
        unit: z.enum(VOUCHER_VALIDITY_UNITS),
        // the older one-step form
        duration: z.enum(['month', 'week', 'day', 'minute']),
      })
      .partial(),
    "Overrides the campaign's validity; left out, the campaign's applies.",
  ).optional(),
});

export const adjustScoreActionConfigSchema = z
  .object({
    mode: described(
      z.enum(['campaign', 'fixed']),
      "fixed gives points into the accountTypeId wallet; campaign earns by the campaign's table.",
    ).optional(),
    attribution,
    ownerType,
    accountTypeId: described(
      z.string(),
      '_id of the wallet, for fixed.',
    ).optional(),
    points: described(
      z.union([z.number(), z.string()]),
      'Points given, a number or a {{ }} placeholder.',
    ).optional(),
    campaignId: described(z.string(), '_id of the score campaign.').optional(),
    action: z.enum(['add', 'subtract']).optional(),
    earnRowKeys: described(
      z.array(z.string()),
      'Earning rows of the campaign this step uses; every row when absent.',
    ).optional(),
  })
  .refine(({ mode, accountTypeId }) => mode !== 'fixed' || !!accountTypeId, {
    path: ['accountTypeId'],
    message: 'Required for a fixed score',
  })
  .refine(({ mode, campaignId }) => mode === 'fixed' || !!campaignId, {
    path: ['campaignId'],
    message: 'Required unless the score is fixed',
  })
  .refine(({ mode, action }) => mode === 'fixed' || action !== 'subtract', {
    path: ['action'],
    message: 'A campaign only adds; points paid with are recorded by the sale',
  });

export const setTierActionConfigSchema = z
  .object({
    attribution,
    accountTypeId: requiredText('_id of the wallet whose tier is set.'),
    mode: described(
      z.enum(['fixed', 'amount']),
      'fixed sets tier; amount picks the tier whose band holds the purchase total.',
    ).optional(),
    tier: described(
      z.string(),
      'Tier key of the wallet; empty clears the tier.',
    ).optional(),
    bands: z
      .array(
        z.object({
          tier: z.string(),
          min: z.number().optional(),
          max: z.number().optional(),
        }),
      )
      .optional(),
    onlyUpgrade: z.boolean().optional(),
    keepHigherTier: z.boolean().optional(),
  })
  .refine(({ mode, bands }) => mode !== 'amount' || !!bands?.length, {
    path: ['bands'],
    message: 'Enter an amount for at least one tier',
  });

export const awardSpinActionConfigSchema = z.object({
  spinCampaignId: requiredText('_id of the spin campaign.'),
  attribution: optionalAttribution,
  ownerType,
  ...legacyOwners,
});
