import type { Request, Response } from 'express';
import { receiveTelegramPoll } from './polls';
import { receiveTelegramReaction } from './reactions';
import { getSubdomain } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { telegramUpdateSchema } from '@/integrations/telegram/utils/update';
import { receiveTelegramMessage } from '@/integrations/telegram/controller/receiveMessage';

/** Dispatches authenticated updates and acknowledges only completed or unsupported events. */
export const telegramWebhook = async (
  req: Request<{ _id: string }, unknown, unknown>,
  res: Response<unknown>,
): Promise<void> => {
  const update = telegramUpdateSchema.parse(req.body);

  const payload =
    update.message ??
    update.channel_post ??
    update.edited_message ??
    update.edited_channel_post;
  if (
    payload === undefined &&
    update.poll === undefined &&
    update.message_reaction === undefined &&
    update.message_reaction_count === undefined
  ) {
    res.sendStatus(200);
    return;
  }

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);
  const bot = await models.TelegramBots.getBot(req.params._id);

  if (payload === undefined) {
    const integration = bot.erxesApiId
      ? await models.Integrations.findOne({
          _id: bot.erxesApiId,
          kind: 'telegram-messenger',
          isActive: { $ne: false },
        })
      : null;
    if (integration && bot.erxesApiId) {
      const context = {
        models,
        subdomain,
        integrationId: bot.erxesApiId,
        updateId: update.update_id,
      };
      if (update.poll !== undefined)
        await receiveTelegramPoll({ ...context, payload: update.poll });
      else
        await receiveTelegramReaction({
          ...context,
          payload: update.message_reaction ?? update.message_reaction_count,
          anonymous: update.message_reaction_count !== undefined,
        });
    }
    res.sendStatus(200);
    return;
  }
  await receiveTelegramMessage({
    models,
    subdomain,
    bot,
    payload,
    updateId: update.update_id,
  });

  res.sendStatus(200);
};
