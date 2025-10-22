import { IContext } from '~/connectionResolvers';
import { IFacebookBotDocument } from '@/integrations/facebook/db/definitions/bots';
import { graphRequest } from '@/integrations/facebook/utils';

export default {
  async account(
    { accountId }: IFacebookBotDocument,
    _args,
    { models }: IContext,
  ) {
    return models.FacebookAccounts.findOne({ _id: accountId }).select({
      name: 1,
    });
  },

  async page({ token, pageId }: IFacebookBotDocument, _args) {
    try {
      const response: any = await graphRequest.get(
        `/${pageId}?fields=name`,
        token,
      );
      return response || null;
    } catch (error) {
      return null;
    }
  },

  async profileUrl({ pageId, token }: IFacebookBotDocument) {
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
