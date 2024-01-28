import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { getPageAccessTokenFromMap, graphRequest } from '../utils';
import { IBotDocument, botSchema } from './definitions/bots';
import { debugError } from '../debuggers';

const validateDoc = async (models: IModels, doc: any, isUpdate?: boolean) => {
  if (!doc.name) {
    throw new Error('Please provide a name of bot');
  }

  if (!doc.accountId) {
    throw new Error('Please select a facebook account');
  }

  if (!doc.pageId) {
    throw new Error('Please select a facebook page');
  }

  if (
    !isUpdate &&
    (await models.Bots.findOne({
      pageId: doc.pageId,
      accountId: doc.accountId,
    }))
  ) {
    throw new Error('This page has already been registered as a bot');
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
        await validateDoc(models, doc);
      } catch (error) {
        throw new Error(error.message);
      }

      const { accountId, pageId } = doc;

      const integration = await models.Integrations.findOne({
        accountId,
        facebookPageIds: { $in: [pageId] },
      });

      try {
        return await this.connectBotPageMessenger(integration, pageId, doc);
      } catch (error) {
        throw new Error(error.message);
      }
    }

    public static async updateBot(_id, doc) {
      console.log({ _id, doc });
      try {
        await validateDoc(models, doc, true);
      } catch (error) {
        throw new Error(error.message);
      }

      const { accountId, pageId, persistentMenus } = doc;

      const { integrationId, ...bot } =
        (await models.Bots.findOne({ _id })
          .select({
            _id: 0,
            accountId: 1,
            pageId: 1,
            persistentMenus: 1,
            integrationId: 1,
          })
          .lean()) || {};

      if (!bot) {
        throw new Error('Not found');
      }

      console.log({ bot });

      if (
        JSON.stringify({ accountId, pageId, persistentMenus }) !==
        JSON.stringify({ ...bot })
      ) {
        try {
          const integration = await models.Integrations.findOne({
            _id: integrationId,
          });
          await this.disconnectBotPageMessenger(_id);

          await this.connectBotPageMessenger(integration, pageId, doc);
          return { status: 'success' };
        } catch (error) {
          throw new Error(error.message);
        }
      }

      await models.Bots.updateOne({ _id }, { ...doc });
      return { status: 'success' };
    }

    public static async removeBot(_id) {
      if (!(await models.Bots.findOne({ _id }))) {
        throw new Error('Not found');
      }

      try {
        await this.disconnectBotPageMessenger(_id);
      } catch (error) {
        debugError(error.message);
      }

      await models.Bots.deleteOne({ _id });

      return { status: 'success' };
    }

    static async connectBotPageMessenger(integration, pageId, doc) {
      const pageAccessToken = getPageAccessTokenFromMap(
        pageId,
        integration?.facebookPageTokensMap || {},
      );

      if (!pageAccessToken) {
        throw new Error('Cannot find access token');
      }

      const bot = await models.Bots.create({
        ...doc,
        integrationId: integration._id,
      });

      let persistentMenus: any[] = [];

      for (const { type, text, link } of doc?.persistentMenus || []) {
        if (text) {
          if (type === 'link' && link) {
            persistentMenus.push({
              type: 'web_url',
              title: text,
              url: link,
              webview_height_ratio: 'full',
            });
          } else {
            persistentMenus.push({
              type: 'postback',
              title: text,
              payload: bot._id,
            });
          }
        }
      }

      console.log({ persistentMenus });

      await graphRequest.post('/me/messenger_profile', pageAccessToken, {
        get_started: { payload: bot._id },
        persistent_menu: [
          {
            locale: 'default',
            composer_input_disabled: false,
            call_to_actions: [
              {
                type: 'postback',
                title: 'Get Started',
                payload: bot._id,
              },
              ...persistentMenus,
            ],
          },
        ],
      });

      console.log('Hello world');

      return { status: 'success' };
    }

    static async disconnectBotPageMessenger(_id) {
      const bot = await models.Bots.findOne({ _id });

      const integration = await models.Integrations.findOne({
        _id: bot?.integrationId,
      });

      console.log({ integration });

      if (!bot || !integration) {
        throw new Error('Something went wrong');
      }

      const pageAccessToken = getPageAccessTokenFromMap(
        bot.pageId,
        integration?.facebookPageTokensMap || {},
      );

      if (!pageAccessToken) {
        throw new Error('Cannot find access token');
      }

      console.log({ pageAccessToken });

      await graphRequest.delete(`/me/messenger_profile`, pageAccessToken, {
        fields: ['get_started', 'persistent_menu'],
        access_token: pageAccessToken,
      });

      await models.Bots.deleteOne({ _id });

      return { status: 'success' };
    }
  }

  botSchema.loadClass(Bot);
  return botSchema;
};
