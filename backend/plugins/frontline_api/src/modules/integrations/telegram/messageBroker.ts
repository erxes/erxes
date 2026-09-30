import { z } from 'zod';
import { generateModels } from '~/connectionResolvers';

const telegramIntegrationDataSchema = z
  .object({
    sourceBotId: z.string().min(1),
  })
  .strict();

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
