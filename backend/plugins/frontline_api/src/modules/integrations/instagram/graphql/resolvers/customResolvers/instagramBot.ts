import { IContext } from '~/connectionResolvers';
import { IInstagramBotDocument } from '@/integrations/instagram/@types/bots';
import { graphRequest } from '@/integrations/instagram/utils';

export default {
  async account(bot: IInstagramBotDocument, _args, { models }: IContext) {
    return models.InstagramAccounts.findOne({ _id: bot.accountId }).select({
      name: 1,
    });
  },

  async page(
    { token, pageId }: IInstagramBotDocument,
    _args,
    { models }: IContext,
  ) {
    try {
      const response: any = await graphRequest.get(
        `/${pageId}?fields=name`,
        token,
      );
      return response ? response : null;
    } catch (error) {
      return null;
    }
  },

  async profileUrl({ pageId, token }: IInstagramBotDocument) {
    try {
      const response: any = await graphRequest.get(
        `/${pageId}/picture?height=600`,
        token,
      );

      if (!response) {
        return null;
      }

      return response?.location || null;
    } catch (err) {
      return null;
    }
  },
};
