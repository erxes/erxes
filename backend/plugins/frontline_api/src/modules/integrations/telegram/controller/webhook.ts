import type { Request, Response } from 'express';
import { getSubdomain } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { telegramUpdateSchema } from '@/integrations/telegram/utils/update';
import { receiveTelegramMessage } from '@/integrations/telegram/controller/receiveMessage';

export const telegramWebhook = async (
  req: Request<{ _id: string }, unknown, unknown>,
  res: Response<unknown>,
): Promise<void> => {
  const update = telegramUpdateSchema.parse(req.body);

  if (update.message === undefined) {
    res.sendStatus(200);
    return;
  }

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);
  const bot = await models.TelegramBots.getBot(req.params._id);

  await receiveTelegramMessage({
    models,
    subdomain,
    bot,
    payload: update.message,
  });

  res.sendStatus(200);
};
