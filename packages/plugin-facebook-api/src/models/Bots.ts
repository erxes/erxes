import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { debugError } from '../debuggers';
import { getPageAccessToken, graphRequest } from '../utils';
import { IBotDocument, botSchema } from './definitions/bots';

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
    }))
  ) {
    throw new Error('This page has already been registered as a bot');
  }
};

export interface IBotModel extends Model<IBotDocument> {
  addBot(doc: any): Promise<IBotDocument>;
  updateBot(_id: string, doc: any): Promise<IBotDocument>;
  removeBot(_id: string): Promise<IBotDocument>;
  repair(_id: string): Promise<IBotDocument>;
}

export const loadBotClass = (models: IModels) => {
  class Bot {
    static async getBot(_id) {
      const bot = await models.Bots.findOne({ _id });

      if (!bot) {
        throw new Error('Not found');
      }
      return bot;
    }
    public static async addBot(doc) {
      try {
        await validateDoc(models, doc);
      } catch (error) {
        throw new Error(error.message);
      }

      const { accountId, pageId } = doc;

      const account = await models.Accounts.findOne({ _id: accountId });

      if (!account) {
        throw new Error('Something went wrong');
      }

      let pageTokenResponse;

      try {
        pageTokenResponse = await getPageAccessToken(pageId, account.token);
      } catch (e) {
        debugError(
          `Error ocurred while trying to get page access token with ${e.message}`,
        );
      }

      const bot = await models.Bots.create({
        ...doc,
        uid: account.uid,
        token: pageTokenResponse,
      });

      try {
        return await this.connectBotPageMessenger({
          pageAccessToken: bot.token,
          botId: bot._id,
          persistentMenus: bot.persistentMenus,
        });
      } catch (error) {
        await models.Bots.deleteOne({ _id: bot._id });

        throw new Error(error.message);
      }
    }

    public static async repair(_id) {
      const bot = await this.getBot(_id);

      const account = await models.Accounts.findOne({ _id: bot.accountId });

      if (!account) {
        const relatedAccount = await models.Accounts.findOne({ uid: bot.uid });

        if (!relatedAccount) {
          throw new Error('Not found account');
        }

        const pageAccessToken = await getPageAccessToken(
          bot.pageId,
          relatedAccount.token,
        );

        if (bot.token !== pageAccessToken) {
          bot.token = pageAccessToken;
        }

        bot.accountId = relatedAccount._id;
      }

      await this.connectBotPageMessenger({
        botId: bot._id,
        pageAccessToken: bot.token,
        persistentMenus: bot.persistentMenus,
      });

      return { status: 'success' };
    }

    public static async updateBot(_id, doc) {
      try {
        await validateDoc(models, doc, true);
      } catch (error) {
        throw new Error(error.message);
      }

      const { pageId, persistentMenus } = doc;

      const bot = await this.getBot(_id);

      if (
        JSON.stringify({ pageId, persistentMenus }) !==
        JSON.stringify({
          pageId: bot.pageId,
          persistentMenus: bot.persistentMenus,
        })
      ) {
        try {
          if (pageId !== bot.pageId) {
            await this.disconnectBotPageMessenger(_id);
          }

          await this.connectBotPageMessenger({
            botId: bot._id,
            pageAccessToken: bot.token,
            persistentMenus: doc.persistentMenus,
          });
        } catch (error) {
          throw new Error(error.message);
        }
      }

      await models.Bots.updateOne({ _id }, { ...doc });
      return { status: 'success' };
    }

    public static async removeBot(_id) {
      try {
        await this.disconnectBotPageMessenger(_id);
      } catch (error) {
        debugError(error.message);
      }

      await models.Bots.deleteOne({ _id });

      return { status: 'success' };
    }

    static async connectBotPageMessenger({
      botId,
      pageAccessToken,
      persistentMenus,
    }) {
      let generatedPersistentMenus: any[] = [];

      for (const { _id, type, text, link } of persistentMenus || []) {
        if (text) {
          if (type === 'link' && link) {
            generatedPersistentMenus.push({
              type: 'web_url',
              title: text,
              url: link,
              webview_height_ratio: 'full',
            });
          } else {
            generatedPersistentMenus.push({
              type: 'postback',
              title: text,
              payload: JSON.stringify({
                botId,
                persistentMenuId: _id,
              }),
            });
          }
        }
      }

      await graphRequest.post('/me/messenger_profile', pageAccessToken, {
        get_started: { payload: JSON.stringify({ botId: botId }) },
        persistent_menu: [
          {
            locale: 'default',
            composer_input_disabled: false,
            call_to_actions: [
              {
                type: 'postback',
                title: 'Get Started',
                payload: JSON.stringify({ botId: botId }),
              },
              ...generatedPersistentMenus,
            ],
          },
        ],
      });

      return { status: 'success' };
    }

    static async disconnectBotPageMessenger(_id) {
      const bot = await this.getBot(_id);

      const pageAccessToken = bot.token || '';

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
