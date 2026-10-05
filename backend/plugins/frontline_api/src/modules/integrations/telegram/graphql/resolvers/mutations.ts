import type { IContext } from '~/connectionResolvers';
import type { ITelegramBotDocument } from '@/integrations/telegram/@types/bot';

export const telegramMutations = {
  async telegramAddBot(
    _root: undefined,
    { token }: { token: string },
    { models, user, checkPermission }: IContext,
  ): Promise<ITelegramBotDocument> {
    await checkPermission('integrationsAdd');

    return models.TelegramBots.createBot({
      token,
      createdBy: user._id,
    });
  },
  async telegramSetWebhook(
    _root: undefined,
    { _id, url }: { _id: string; url: string },
    { models, checkPermission }: IContext,
  ): Promise<boolean> {
    await checkPermission('integrationsEdit');

    return models.TelegramBots.setWebhook(_id, url);
  },
};
