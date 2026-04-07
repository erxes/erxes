import { IAfterProcessRule } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IFacebookIntegrationDocument } from '@/integrations/facebook/@types/integrations';
import { debugError } from '@/integrations/facebook/debuggers';

export const facebookAfterProcessWorkers = {
  rules: [
    {
      type: 'createdDocument',
      contentTypes: ['frontline:facebook.integration'],
    },
  ] as IAfterProcessRule[],
  createdDocument: {
    integration: async (
      models: IModels,
      data: { fullDocument: IFacebookIntegrationDocument },
    ) => {
      const fullDocument = data?.fullDocument || {};

      const {
        facebookPageIds = [],
        accountId,
        facebookPageTokensMap = {},
      } = fullDocument;
      const bot = await models.FacebookBots.findOne({
        pageId: { $in: facebookPageIds },
      }).lean();
      if (bot && facebookPageTokensMap[bot.pageId]) {
        models.FacebookBots.reviveByPageId({
          pageId: bot.pageId,
          accountId,
          token: facebookPageTokensMap[bot.pageId],
          notify: true,
        }).catch((error) => {
          debugError(
            `Failed to revive facebook bot after integration creation: ${error.message}`,
          );
        });
      }
    },
  },
};
