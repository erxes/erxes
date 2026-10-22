import { z } from 'zod';
import { generateModels, IModels } from '~/connectionResolvers';
import { IWhatsappIntegrationDocument } from '@/integrations/whatsapp/@types/integrations';
import {
  WHATSAPP_ERROR_CODES,
  WHATSAPP_KIND,
} from '@/integrations/whatsapp/constants';
import {
  ensureWhatsappVerifyToken,
  getWhatsappWebhookUrl,
} from '@/integrations/whatsapp/config';
import {
  describeWhatsappSendError,
  IWhatsappReplyResult,
  sendWhatsappReply,
} from '@/integrations/whatsapp/controller/sendMessage';
import { debugWhatsapp } from '@/integrations/whatsapp/debuggers';
import {
  claimWaba,
  getWabaOwner,
  releaseWaba,
} from '@/integrations/whatsapp/wabaOwnership';
import {
  WhatsappGraphError,
  getPhoneNumber,
  registerPhoneNumber,
  subscribeWabaWebhooks,
  unsubscribeWabaWebhooks,
} from '@/integrations/whatsapp/graphApi';

type ServiceResult =
  | { status: 'success' }
  | { status: 'error'; errorMessage: string };

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const whatsappCreateDataSchema = z
  .object({
    connectionId: z.string().min(1),
    pin: z
      .string()
      .regex(/^\d{6}$/, 'The PIN must be exactly 6 digits')
      .optional(),
  })
  .strict();

const PIN_REQUIRED_ON_CREATE =
  "Enter this number's 6-digit two-step verification PIN to register it with WhatsApp.";
const PIN_REQUIRED_ON_REPAIR =
  'WhatsApp needs this number registered again with its 6-digit two-step verification PIN. Remove this integration and connect the number again with its PIN.';

/**
 * Registers a number that is not yet on the Cloud API with the customer's
 * own two-step verification PIN: it becomes the number's PIN when none is
 * set, so erxes never invents one the business would not know. The PIN is
 * used for this call only and never stored.
 */
const registerIfNeeded = async ({
  connection,
  pin,
  missingPinMessage,
}: {
  connection: IWhatsappIntegrationDocument;
  pin?: string;
  missingPinMessage: string;
}): Promise<void> => {
  if (connection.phoneStatus === 'CONNECTED') return;

  if (!pin) throw new Error(missingPinMessage);

  try {
    await registerPhoneNumber(
      connection.accessToken,
      connection.phoneNumberId,
      pin,
    );
  } catch (error) {
    if (
      error instanceof WhatsappGraphError &&
      error.code === WHATSAPP_ERROR_CODES.PIN_MISMATCH
    ) {
      throw new Error(
        'The two-step verification PIN is incorrect. Check it in WhatsApp Manager and try again.',
      );
    }

    if (
      error instanceof WhatsappGraphError &&
      error.code === WHATSAPP_ERROR_CODES.REGISTRATION_RATE_LIMIT
    ) {
      throw new Error(
        'WhatsApp blocked registration for this number after too many attempts. Try again in 72 hours.',
      );
    }

    throw error;
  }
};

/** Routes the WABA's message webhooks to this tenant and refreshes the number's status. */
const connectWebhooks = async (
  models: IModels,
  subdomain: string,
  connection: IWhatsappIntegrationDocument,
): Promise<string | undefined> => {
  await subscribeWabaWebhooks(connection.accessToken, connection.wabaId, {
    url: getWhatsappWebhookUrl(subdomain),
    verifyToken: await ensureWhatsappVerifyToken(models),
  });

  const phone = await getPhoneNumber(
    connection.accessToken,
    connection.phoneNumberId,
  );

  return phone.status;
};

/** Frees the WABA when a failed attach leaves this workspace with no number from it. */
const releaseWabaIfUnused = async (
  models: IModels,
  subdomain: string,
  wabaId: string,
): Promise<void> => {
  const used = await models.WhatsappIntegrations.exists({
    wabaId,
    erxesApiId: { $exists: true },
  });

  if (!used) await releaseWaba(wabaId, subdomain);
};

/** Attaches a pending Embedded Signup connection to the new inbox integration. */
export const whatsappCreateIntegration = async ({
  subdomain,
  data,
}: {
  subdomain: string;
  data: { integrationId: string; kind: string; data?: string };
}): Promise<ServiceResult> => {
  if (data.kind !== WHATSAPP_KIND) {
    throw new Error('Unsupported WhatsApp integration kind');
  }

  let parsedData: unknown;

  try {
    parsedData = JSON.parse(data.data || '{}');
  } catch {
    throw new Error('Invalid WhatsApp integration data');
  }

  const parsed = whatsappCreateDataSchema.safeParse(parsedData);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message || 'Connect a WhatsApp number first',
    );
  }

  const models = await generateModels(subdomain);
  const connection = await models.WhatsappIntegrations.getConnection(
    parsed.data.connectionId,
  );

  if (
    connection.erxesApiId &&
    (await models.Integrations.exists({ _id: connection.erxesApiId }))
  ) {
    throw new Error('This WhatsApp number is already connected to an inbox');
  }

  await claimWaba(connection.wabaId, subdomain);

  let phoneStatus: string | undefined;

  try {
    await registerIfNeeded({
      connection,
      pin: parsed.data.pin,
      missingPinMessage: PIN_REQUIRED_ON_CREATE,
    });
    phoneStatus = await connectWebhooks(models, subdomain, connection);
  } catch (error) {
    await releaseWabaIfUnused(models, subdomain, connection.wabaId);
    throw error;
  }

  const attached = await models.WhatsappIntegrations.updateOne(
    {
      _id: connection._id,
      erxesApiId: connection.erxesApiId ?? { $exists: false },
    },
    {
      $set: {
        erxesApiId: data.integrationId,
        phoneStatus,
        healthStatus: 'healthy',
      },
      $unset: { error: '', pendingSince: '' },
    },
  );

  if (!attached.modifiedCount) {
    await releaseWabaIfUnused(models, subdomain, connection.wabaId);
    throw new Error(
      'This WhatsApp number was connected to another inbox meanwhile',
    );
  }

  return { status: 'success' };
};

/** Detaches the number; the WABA webhook is unsubscribed when no other inbox uses it. */
export const whatsappRemoveIntegration = async ({
  subdomain,
  data,
}: {
  subdomain: string;
  data: { integrationId?: string };
}): Promise<ServiceResult> => {
  if (!data.integrationId) throw new Error('Integration ID is required');

  const models = await generateModels(subdomain);
  const connection = await models.WhatsappIntegrations.findOne({
    erxesApiId: data.integrationId,
  }).select('+accessToken');

  if (!connection) return { status: 'success' };

  const wabaStillUsed = await models.WhatsappIntegrations.exists({
    _id: { $ne: connection._id },
    wabaId: connection.wabaId,
    erxesApiId: { $exists: true },
  });
  const owner = await getWabaOwner(connection.wabaId);

  // Never unsubscribe a WABA another workspace owns: it would cut its webhooks.
  if (!wabaStillUsed && (!owner || owner === subdomain)) {
    try {
      await unsubscribeWabaWebhooks(connection.accessToken, connection.wabaId);
    } catch (error) {
      // Webhooks for an unknown number are ignored, so removal still succeeds.
      debugWhatsapp(`WhatsApp unsubscribe failed: ${errorMessage(error)}`);
    }

    await releaseWaba(connection.wabaId, subdomain);
  }

  await models.WhatsappCustomers.deleteMany({
    integrationId: data.integrationId,
  });
  await models.WhatsappIntegrations.deleteOne({ _id: connection._id });

  return { status: 'success' };
};

/** Re-registers if needed, re-subscribes webhooks and records the outcome as health. */
export const whatsappRepairIntegration = async ({
  subdomain,
  data,
}: {
  subdomain: string;
  data: { integrationId: string };
}): Promise<ServiceResult> => {
  const models = await generateModels(subdomain);
  const connection = await models.WhatsappIntegrations.findOne({
    erxesApiId: data.integrationId,
  }).select('+accessToken');

  if (!connection) {
    return { status: 'error', errorMessage: 'WhatsApp integration not found' };
  }

  try {
    // Also claims WABAs connected before ownership was recorded.
    await claimWaba(connection.wabaId, subdomain);
    await registerIfNeeded({
      connection,
      missingPinMessage: PIN_REQUIRED_ON_REPAIR,
    });

    const phoneStatus = await connectWebhooks(models, subdomain, connection);

    await models.WhatsappIntegrations.updateOne(
      { _id: connection._id },
      { $set: { phoneStatus, healthStatus: 'healthy' }, $unset: { error: '' } },
    );

    return { status: 'success' };
  } catch (error) {
    const message = describeWhatsappSendError(error);

    await models.WhatsappIntegrations.markHealth(connection._id, message);

    return { status: 'error', errorMessage: message };
  }
};

export const whatsappStatus = async ({
  subdomain,
  data,
}: {
  subdomain: string;
  data: { integrationId: string };
}) => {
  try {
    const models = await generateModels(subdomain);
    const connection = await models.WhatsappIntegrations.findOne({
      erxesApiId: data.integrationId,
    }).lean();

    return {
      status: 'success',
      data: {
        status: connection?.healthStatus || 'healthy',
        error: connection?.error,
      },
    };
  } catch (error) {
    // The status column must not break the integrations list.
    debugWhatsapp(`WhatsApp status failed: ${errorMessage(error)}`);

    return { status: 'success', data: { status: 'healthy' } };
  }
};

const replyEnvelopeSchema = z
  .object({ integrationId: z.string().min(1) })
  .passthrough();

type WhatsappIntegrationResponse =
  | { status: 'success'; data: IWhatsappReplyResult }
  | { status: 'error'; errorMessage: string };

/** Validates reply routing and adapts provider errors to the inbox service envelope. */
export const handleWhatsappIntegration = async ({
  subdomain,
  data,
}: {
  subdomain: string;
  data: {
    type: string;
    action: string;
    payload: string;
    integrationId: string;
  };
}): Promise<WhatsappIntegrationResponse> => {
  try {
    if (data.type !== 'whatsapp' || data.action !== 'reply-messenger') {
      throw new Error('Unsupported WhatsApp integration action');
    }

    let payload: unknown;

    try {
      payload = JSON.parse(data.payload);
    } catch {
      throw new Error('Invalid WhatsApp reply JSON');
    }

    const envelope = replyEnvelopeSchema.safeParse(payload);

    if (
      !envelope.success ||
      envelope.data.integrationId !== data.integrationId
    ) {
      throw new Error(
        'WhatsApp reply integration does not match its destination',
      );
    }

    const models = await generateModels(subdomain);
    const reply = await sendWhatsappReply({
      models,
      subdomain,
      payload: envelope.data,
    });

    return { status: 'success', data: reply };
  } catch (error) {
    return { status: 'error', errorMessage: errorMessage(error) };
  }
};
