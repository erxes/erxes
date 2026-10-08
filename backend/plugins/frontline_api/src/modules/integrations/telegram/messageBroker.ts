import { z } from 'zod';
import { randomBytes } from 'node:crypto';
import debug from 'debug';
import { deleteTelegramWebhook } from './client';
import { generateModels } from '~/connectionResolvers';
import {
  sendTelegramReply,
  type ITelegramReplyResult,
} from '@/integrations/telegram/controller/sendMessage';

const telegramIntegrationDataSchema = z
  .object({
    sourceBotId: z.string().min(1),
  })
  .strict();

/** Validates saved-bot setup data and attaches it to the tenant inbox integration. */
export const telegramCreateIntegrations = async ({
  subdomain,
  data,
}: {
  subdomain: string;
  data: {
    integrationId: string;
    kind: string;
    data?: string;
  };
}): Promise<{ status: 'success' }> => {
  if (data.kind !== 'telegram-messenger') {
    throw new Error('Unsupported Telegram integration kind');
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(data.data || '{}');
  } catch {
    throw new Error('Invalid Telegram integration data');
  }

  const result = telegramIntegrationDataSchema.safeParse(parsed);

  if (!result.success) {
    throw new Error('Select a saved Telegram bot');
  }

  const models = await generateModels(subdomain);

  await models.TelegramBots.attachIntegration(
    result.data.sourceBotId,
    data.integrationId,
  );

  return { status: 'success' };
};

const telegramReplyEnvelopeSchema = z
  .object({
    integrationId: z.string().min(1),
  })
  .passthrough();

type TelegramIntegrationResponse =
  | {
      status: 'success';
      data: ITelegramReplyResult;
    }
  | {
      status: 'error';
      errorMessage: string;
    };

/** Validates reply routing and adapts provider errors to the inbox service envelope. */
export const handleTelegramIntegration = async ({
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
}): Promise<TelegramIntegrationResponse> => {
  try {
    if (data.type !== 'telegram' || data.action !== 'reply-messenger') {
      throw new Error('Unsupported Telegram integration action');
    }

    let payload: unknown;

    try {
      payload = JSON.parse(data.payload);
    } catch {
      throw new Error('Invalid Telegram reply JSON');
    }

    const parsed = telegramReplyEnvelopeSchema.safeParse(payload);

    if (!parsed.success || parsed.data.integrationId !== data.integrationId) {
      throw new Error(
        'Telegram reply integration does not match its destination',
      );
    }

    const models = await generateModels(subdomain);
    const reply = await sendTelegramReply({
      models,
      subdomain,
      payload: parsed.data,
    });

    return {
      status: 'success',
      data: reply,
    };
  } catch (error: unknown) {
    return {
      status: 'error',
      errorMessage:
        error instanceof Error
          ? error.message
          : 'Could not process the Telegram reply',
    };
  }
};

/** Detaches the bot and rotates its secret before best-effort remote cleanup. */
export const telegramRemoveIntegration = async ({
  subdomain,
  data,
}: {
  subdomain: string;
  data: { integrationId?: string };
}): Promise<void> => {
  if (!data.integrationId) throw new Error('Integration ID is required');
  const models = await generateModels(subdomain);
  const bot = await models.TelegramBots.findOne({
    erxesApiId: data.integrationId,
  }).select('+token');
  if (!bot) return;
  await models.TelegramBots.updateOne(
    { _id: bot._id, erxesApiId: data.integrationId },
    {
      $unset: { erxesApiId: '' },
      $set: { webhookSecret: randomBytes(32).toString('hex') },
    },
  );
  try {
    await deleteTelegramWebhook(bot.token, true);
  } catch {
    // The rotated secret and detached mapping already prevent ingestion.
    debug('erxes:telegram:error')(
      'Telegram webhook cleanup was not confirmed after integration removal.',
    );
  }
};
