import { Model } from 'mongoose';
import { IFacebookBotDocument, facebookBotSchema } from '../definitions/bots';
import {
  getPageAccessToken,
  graphRequest,
} from '@/integrations/facebook/utils';
import { IModels } from '~/connectionResolvers';
import { BOT_SUBSCRIBE_FIELDS } from '@/integrations/facebook/constants';

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
    (await models.FacebookBots.findOne({
      pageId: doc.pageId,
    }))
  ) {
    throw new Error('This page has already been registered as a bot');
  }
};

export interface IFacebookBotModel extends Model<IFacebookBotDocument> {
  addBot(doc: any): Promise<IFacebookBotDocument>;
  updateBot(_id: string, doc: any): Promise<IFacebookBotDocument>;
  removeBot(_id: string): Promise<IFacebookBotDocument>;
  repair(_id: string): Promise<IFacebookBotDocument>;
}

export const loadFacebookBotClass = (models: IModels) => {
  class FacebookBot {
    static async getBot(_id) {
      const bot = await models.FacebookBots.findOne({ _id });

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

      const account = await models.FacebookAccounts.findOne({ _id: accountId });

      if (!account) {
        throw new Error('Something went wrong');
      }

      let pageTokenResponse;

      try {
        pageTokenResponse = await getPageAccessToken(pageId, account.token);
      } catch (e) {
        console.error(
          `Error ocurred while trying to get page access token with ${e.message}`,
        );
      }

      const bot = await models.FacebookBots.create({
        ...doc,
        uid: account.uid,
        token: pageTokenResponse,
      });

      try {
        return await this.connectBotPageMessenger({
          pageAccessToken: bot.token,
          botId: bot._id,
          persistentMenus: bot.persistentMenus,
          greetText: bot?.greetText,
          isEnabledBackBtn: bot?.isEnabledBackBtn,
          backButtonText: bot?.backButtonText,
        });
      } catch (error) {
        await models.FacebookBots.deleteOne({ _id: bot._id });

        throw new Error(error.message);
      }
    }

    public static async repair(_id) {
      const bot = await this.getBot(_id);

      const account = await models.FacebookAccounts.findOne({
        _id: bot.accountId,
      });

      if (!account) {
        const relatedAccount = await models.FacebookAccounts.findOne({
          uid: bot.uid,
        });

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

      try {
        await this.connectBotPageMessenger({
          botId: bot._id,
          pageAccessToken: bot.token,
          persistentMenus: bot.persistentMenus,
          greetText: bot.greetText,
          isEnabledBackBtn: bot?.isEnabledBackBtn,
          backButtonText: bot?.backButtonText,
        });
      } catch (err) {
        throw new Error(err.message);
      }

      return { status: 'success' };
    }

    public static async updateBot(_id, doc) {
      try {
        await validateDoc(models, doc, true);
      } catch (error) {
        throw new Error(error.message);
      }

      const {
        pageId,
        persistentMenus,
        greetText,
        isEnabledBackBtn,
        backButtonText,
      } = doc;

      const bot = await this.getBot(_id);

      if (
        JSON.stringify({
          pageId,
          persistentMenus,
          greetText,
          isEnabledBackBtn,
          backButtonText,
        }) !==
        JSON.stringify({
          pageId: bot.pageId,
          persistentMenus: bot.persistentMenus,
          greetText: bot.greetText,
          isEnabledBackBtn: bot.isEnabledBackBtn,
          backButtonText: bot.backButtonText,
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
            greetText: greetText !== bot.greetText ? greetText : undefined,
            isEnabledBackBtn: bot?.isEnabledBackBtn,
            backButtonText: bot?.backButtonText,
          });
        } catch (error) {
          throw new Error(error.message);
        }
      }

      await models.FacebookBots.updateOne({ _id }, { ...doc });
      return { status: 'success' };
    }

    public static async removeBot(_id) {
      try {
        await this.disconnectBotPageMessenger(_id);
      } catch (error) {
        console.error(`Failed to disconnect bot ${_id} from messenger:`, error);
      }

      await models.FacebookBots.deleteOne({ _id });

      return { status: 'success' };
    }

    static async connectBotPageMessenger({
      botId,
      pageAccessToken,
      persistentMenus,
      greetText,
      isEnabledBackBtn,
      backButtonText,
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

      if (isEnabledBackBtn) {
        generatedPersistentMenus.push({
          type: 'postback',
          title: backButtonText || 'Back',
          payload: JSON.stringify({
            botId,
            isBackBtn: true,
            persistentMenuId: Math.random(),
          }),
        });
      }

      await graphRequest.post('/me/subscribed_apps', pageAccessToken, {
        subscribed_fields: BOT_SUBSCRIBE_FIELDS,
      });

      let doc: any = {
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
      };

      if (greetText) {
        doc.greeting = [
          {
            locale: 'default',
            text: greetText,
          },
        ];
      }

      await graphRequest.post('/me/messenger_profile', pageAccessToken, doc);

      return { status: 'success' };
    }

    static async disconnectBotPageMessenger(_id) {
      const bot = await this.getBot(_id);

      const pageAccessToken = bot.token || '';

      await graphRequest.delete(`/me/messenger_profile`, pageAccessToken, {
        fields: ['get_started', 'persistent_menu'],
        access_token: pageAccessToken,
      });

      await models.FacebookBots.deleteOne({ _id });

      return { status: 'success' };
    }
  }

  facebookBotSchema.loadClass(FacebookBot);
  return facebookBotSchema;
};
