import { TFunction } from 'i18next';
import { z } from 'zod';

export const MOBILE_PUSH_CONFIG_CODE = 'GOOGLE_APPLICATION_CREDENTIALS_JSON';

const REQUIRED_FIELDS = ['project_id', 'private_key', 'client_email'];

export const parseServiceAccount = (
  value: string,
): Record<string, unknown> | null => {
  try {
    const parsed = JSON.parse(value);

    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

export const getMobilePushConfigSchema = (t: TFunction) =>
  z.object({
    serviceAccount: z
      .string()
      .trim()
      .min(1, t('required'))
      .superRefine((value, ctx) => {
        const serviceAccount = parseServiceAccount(value);

        if (!serviceAccount) {
          ctx.addIssue({ code: 'custom', message: t('invalid-json') });
          return;
        }

        if (serviceAccount.type !== 'service_account') {
          ctx.addIssue({ code: 'custom', message: t('not-service-account') });
          return;
        }

        if (REQUIRED_FIELDS.some((field) => !serviceAccount[field])) {
          ctx.addIssue({ code: 'custom', message: t('missing-fields') });
        }
      }),
  });

export type TMobilePushConfigForm = z.infer<
  ReturnType<typeof getMobilePushConfigSchema>
>;
