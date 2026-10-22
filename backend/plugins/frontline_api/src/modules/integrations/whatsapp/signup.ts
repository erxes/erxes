import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
import { IWhatsappApp } from '@/integrations/whatsapp/@types/configs';
import { IWhatsappConnectionView } from '@/integrations/whatsapp/@types/integrations';
import { WHATSAPP_REQUIRED_SCOPES } from '@/integrations/whatsapp/constants';
import {
  requireWhatsappApp,
  resolveWhatsappApp,
} from '@/integrations/whatsapp/config';
import {
  WhatsappTokenInfo,
  exchangeEmbeddedSignupCode,
  getPhoneNumber,
  inspectAccessToken,
  listWabaPhoneNumberIds,
} from '@/integrations/whatsapp/graphApi';
import { assertWabaAvailable } from '@/integrations/whatsapp/wabaOwnership';

const metaIdSchema = z.string().regex(/^\d+$/, 'Invalid Meta id');

export const whatsappSignupFinishSchema = z.object({
  code: z.string().min(1, 'Embedded Signup did not return a code'),
  wabaId: metaIdSchema,
  phoneNumberId: metaIdSchema,
  businessId: metaIdSchema.optional(),
});

export type WhatsappSignupFinishInput = z.infer<
  typeof whatsappSignupFinishSchema
>;

/** The token must belong to this app, carry both WhatsApp scopes, and cover the WABA. */
export const assertWhatsappTokenGrants = (
  app: IWhatsappApp,
  token: WhatsappTokenInfo,
  wabaId: string,
): void => {
  if (!token.is_valid || token.app_id !== app.appId) {
    throw new Error(
      'Meta returned access for a different app. Check the App ID in WhatsApp settings and connect again.',
    );
  }

  const missing = WHATSAPP_REQUIRED_SCOPES.filter(
    (scope) => !token.scopes?.includes(scope),
  );

  if (missing.length) {
    throw new Error(
      `Meta did not grant ${missing.join(
        ' and ',
      )}. Connect again and allow every requested permission.`,
    );
  }

  const management = token.granular_scopes?.find(
    ({ scope }) => scope === 'whatsapp_business_management',
  );

  if (management?.target_ids && !management.target_ids.includes(wabaId)) {
    throw new Error(
      'Meta did not share the selected WhatsApp Business Account with erxes. Connect again and select it.',
    );
  }
};

/**
 * Exchanges the Embedded Signup code (valid for about 30 seconds), verifies
 * what Meta shared, and saves the phone number as a pending connection that
 * an inbox integration attaches to on creation.
 */
export const finishWhatsappEmbeddedSignup = async ({
  models,
  subdomain,
  userId,
  input,
}: {
  models: IModels;
  subdomain: string;
  userId: string;
  input: WhatsappSignupFinishInput;
}): Promise<IWhatsappConnectionView> => {
  const parsed = whatsappSignupFinishSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message || 'Invalid Embedded Signup result',
    );
  }

  const { code, wabaId, phoneNumberId, businessId } = parsed.data;
  const app = requireWhatsappApp(await resolveWhatsappApp(models));
  const accessToken = await exchangeEmbeddedSignupCode(app, code);

  assertWhatsappTokenGrants(
    app,
    await inspectAccessToken(app, accessToken),
    wabaId,
  );

  const wabaPhoneIds = await listWabaPhoneNumberIds(accessToken, wabaId);

  if (!wabaPhoneIds.includes(phoneNumberId)) {
    throw new Error(
      'The selected phone number does not belong to the shared WhatsApp Business Account.',
    );
  }

  await assertWabaAvailable(wabaId, subdomain);

  const phone = await getPhoneNumber(accessToken, phoneNumberId);

  if (phone.status === 'BANNED') {
    throw new Error(
      'WhatsApp has banned this phone number. Resolve it in WhatsApp Manager first.',
    );
  }

  const existing = await models.WhatsappIntegrations.findOne({ phoneNumberId });

  if (
    existing?.erxesApiId &&
    (await models.Integrations.exists({ _id: existing.erxesApiId }))
  ) {
    throw new Error(
      'This WhatsApp number is already connected to an inbox. Remove that integration first.',
    );
  }

  const connection = await models.WhatsappIntegrations.findOneAndUpdate(
    { phoneNumberId },
    {
      $set: {
        businessId,
        wabaId,
        phoneNumberId,
        displayPhoneNumber: phone.display_phone_number,
        verifiedName: phone.verified_name,
        phoneStatus: phone.status,
        accessToken,
        healthStatus: 'healthy',
        connectedBy: userId,
        pendingSince: new Date(),
      },
      // A stale link to a removed inbox integration must not block reuse.
      $unset: { erxesApiId: '', error: '' },
    },
    { upsert: true, new: true },
  );

  if (!connection) {
    throw new Error('Could not save the WhatsApp connection');
  }

  return models.WhatsappIntegrations.toView(connection);
};
