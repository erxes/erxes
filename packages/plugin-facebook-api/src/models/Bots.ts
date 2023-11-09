import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { getPageAccessTokenFromMap, graphRequest } from '../utils';
import { IBotDocument, botSchema } from './definitions/bots';

const validateDoc = doc => {
  if (doc.name) {
    throw new Error('Please provide a name of bot');
  }

  if (doc.integrationId) {
    throw new Error('Please select a facebook integration');
  }

  if (doc.pageId) {
    throw new Error('Please select a facebook page');
  }
};

export interface IBotModel extends Model<IBotDocument> {
  addBot(doc: any): Promise<IBotDocument>;
  updateBot(_id: string, doc: any): Promise<IBotDocument>;
  removeBot(_id: string): Promise<IBotDocument>;
}

export const loadBotClass = (models: IModels) => {
  class Bot {
    public static async addBot(doc) {
      try {
        validateDoc(doc);
      } catch (error) {
        throw new Error(error.message);
      }

      const { integrationId, pageId } = doc;

      const integration = await models.Integrations.findOne({
        _id: integrationId,
        facebookPageIds: { $in: [pageId] }
      });

      try {
        return await this.connectBotPageMessenger(integration, pageId, doc);
      } catch (error) {
        throw new Error(error.message);
      }
    }

    public static async updateBot(_id, doc) {
      try {
        validateDoc(doc);
      } catch (error) {
        throw new Error(error.message);
      }

      const { integrationId, pageId } = doc;

      const bot = await models.Bots.findOne({ _id }).select({
        _id: 0,
        integrationId: 1,
        pageId: 1
      });

      if (!bot) {
        throw new Error('Not found');
      }

      if (
        JSON.stringify({ integrationId, pageId }) !== JSON.stringify({ ...bot })
      ) {
        await this.disconnectBotPageMessenger(_id);

        await this.connectBotPageMessenger(
          await models.Integrations.findOne({ _id: integrationId }),
          pageId,
          doc
        );
        return { status: 'success' };
      }

      await models.Bots.updateOne({ _id }, { ...doc });
      return { status: 'success' };
    }

    public static async removeBot(_id) {
      if (await models.Bots.findOne({ _id })) {
        throw new Error('Not found');
      }

      await this.disconnectBotPageMessenger(_id);

      await models.Bots.deleteOne({ _id });

      return { status: 'success' };
    }

    static async connectBotPageMessenger(integration, pageId, doc) {
      const pageAccessToken = getPageAccessTokenFromMap(
        pageId,
        integration?.facebookPageTokensMap || {}
      )[pageId];

      if (!pageAccessToken) {
        throw new Error('Cannot find access token');
      }

      try {
        graphRequest.post('/me/messenger_profile', pageAccessToken, {
          get_started: { payload: 'first hand shake' }
        });

        await models.Bots.create({ ...doc });

        return { status: 'success' };
      } catch (error) {
        throw new Error(error.message);
      }
    }

    static async disconnectBotPageMessenger(_id) {
      const bot = await models.Bots.findOne({ id: _id });

      const integration = await models.Integrations.findOne({
        _id: bot?.integrationId
      });

      if (!bot || !integration) {
        throw new Error('Something went wrong');
      }

      const pageAccessToken = getPageAccessTokenFromMap(
        bot.pageId,
        integration?.facebookPageTokensMap || {}
      )[bot.pageId];

      if (!pageAccessToken) {
        throw new Error('Cannot find access token');
      }

      try {
        graphRequest.delete(
          `/me/messenger_profile?fields=get_started`,
          pageAccessToken
        );

        await models.Bots.deleteOne({ _id });

        return { status: 'success' };
      } catch (error) {
        throw new Error(error.message);
      }
    }
  }

  botSchema.loadClass(Bot);
  return botSchema;
};
