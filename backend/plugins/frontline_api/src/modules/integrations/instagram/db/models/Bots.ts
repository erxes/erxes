import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { getPageAccessToken } from '@/integrations/instagram/utils';
import { IInstagramBotDocument } from '@/integrations/instagram/@types/bots';
import { instagramBotSchema } from '@/integrations/instagram/db/definitions/bots';
const validateDoc = async (models: IModels, doc: any, isUpdate?: boolean) => {
  if (!doc.name) {
    throw new Error('Please provide a name of bot');
  }

  if (!doc.accountId) {
    throw new Error('Please select a instagram account');
  }

  if (!doc.pageId) {
    throw new Error('Please select a instagram page');
  }

  if (
    !isUpdate &&
    (await models.InstagramBots.findOne({
      pageId: doc.pageId,
    }))
  ) {
    throw new Error('This page has already been registered as a bot');
  }
};

export interface IBotModel extends Model<IInstagramBotDocument> {
  addBot(doc: any): Promise<IInstagramBotDocument>;
  updateBot(_id: string, doc: any): Promise<IInstagramBotDocument>;
  removeBot(_id: string): Promise<IInstagramBotDocument>;
  repair(_id: string): Promise<IInstagramBotDocument>;
}

export const loadBotClass = (models: IModels) => {
  class Bot {
    static async getBot(_id) {
      const bot = await models.InstagramBots.findOne({ _id });

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

      const { accountId } = doc;

      const account = await models.InstagramAccounts.findOne({
        _id: accountId,
      });

      if (!account) {
        throw new Error('Something went wrong');
      }

      const bot = await models.InstagramBots.create({
        ...doc,
        uid: account.uid,
        token: account.token,
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
        await models.InstagramBots.deleteOne({ _id: bot._id });

        throw new Error(error.message);
      }
    }

    public static async repair(_id) {
      const bot = await this.getBot(_id);

      const account = await models.InstagramAccounts.findOne({
        _id: bot.accountId,
      });

      if (!account) {
        const relatedAccount = await models.InstagramAccounts.findOne({
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

        bot.accountId = relatedAccount._id.toString();
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

      await models.InstagramBots.updateOne({ _id }, { ...doc });
      return { status: 'success' };
    }

    public static async removeBot(_id) {
      try {
        await this.disconnectBotPageMessenger(_id);
      } catch (error) {
        console.error(
          `Failed to disconnect bot ${_id} from instagram messenger:`,
          error,
        );
      }

      await models.InstagramBots.deleteOne({ _id });

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
      const generatedPersistentMenus: any[] = [];

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

      const doc: any = {
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
      return { status: 'success' };
    }

    static async disconnectBotPageMessenger(_id) {
      await models.InstagramBots.deleteOne({ _id });
      return { status: 'success' };
    }
  }

  instagramBotSchema.loadClass(Bot);
  return instagramBotSchema;
};
