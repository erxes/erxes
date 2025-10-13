import { IAfterProcessRule } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IFacebookIntegrationDocument } from '@/integrations/facebook/@types/integrations';

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
        await models.FacebookBots.updateOne(
          { _id: bot._id },
          {
            $set: {
              accountId: accountId,
              token: facebookPageTokensMap[bot.pageId],
            },
          },
        );
      }
    },
  },
};
