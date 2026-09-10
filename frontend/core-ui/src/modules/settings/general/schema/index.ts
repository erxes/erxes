import { CurrencyCode } from 'erxes-ui';
import { z } from 'zod';

export const CurrencyEnum = z.nativeEnum(CurrencyCode);

// The whole page saves as one form, so a setting the organization never chose
// must not fail validation and silently block every other setting from saving.
const generalSettingsSchema = z.object({
  languageCode: z.string(),
  mainCurrency: CurrencyEnum.optional(),
  dealCurrency: CurrencyEnum.array(),
  CHECK_TEAM_MEMBER_SHOWN: z.boolean(),
  BRANCHES_MASTER_TEAM_MEMBERS_IDS: z.string().array(),
  DEPARTMENTS_MASTER_TEAM_MEMBERS_IDS: z.string().array(),
  TIMEZONE: z.string(),
});

export { generalSettingsSchema };
