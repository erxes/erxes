import { Model } from "mongoose";
import { IModels } from "../connectionResolver";
import { debugError } from "../debuggers";
import { getPageAccessToken, graphRequest } from "../utils";
import { IBotDocument, botSchema } from "./definitions/bots";

const validateDoc = async (models: IModels, doc: any, isUpdate?: boolean) => {
  if (!doc.name) {
    throw new Error("Please provide a name of bot");
  }

  if (!doc.accountId) {
    throw new Error("Please select a whatsapp account");
  }

  if (!doc.whatsappNumberIds) {
    throw new Error("Please select a whatsapp number");
  }

  if (
    !isUpdate &&
    (await models.Bots.findOne({
      whatsappNumberIds: doc.whatsappNumberIds
    }))
  ) {
    throw new Error("This page has already been registered as a bot");
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
        throw new Error("Not found");
      }
      return bot;
    }
    public static async addBot(doc) {
      try {
        await validateDoc(models, doc);
      } catch (error) {
        throw new Error(error.message);
      }

      const { accountId, whatsappNumberIds } = doc;

      const account = await models.Accounts.findOne({ _id: accountId });

      if (!account) {
        throw new Error("Something went wrong");
      }

      const bot = await models.Bots.create({
        ...doc,
        uid: account.uid,
        token: account.token
      });

      try {
        return await this.connectBotPageMessenger({
          pageAccessToken: bot.token,
          botId: bot._id,
          persistentMenus: bot.persistentMenus,
          greetText: bot?.greetText,
          isEnabledBackBtn: bot?.isEnabledBackBtn,
          backButtonText: bot?.backButtonText
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
          throw new Error("Not found account");
        }

        // const pageAccessToken = await getPageAccessToken(
        //   bot.whatsappNumberIds,
        //   relatedAccount.token
        // );

        // if (bot.token !== pageAccessToken) {
        //   bot.token = pageAccessToken;
        // }

        // bot.accountId = relatedAccount._id;
      }

      try {
        await this.connectBotPageMessenger({
          botId: bot._id,
          pageAccessToken: bot.token,
          persistentMenus: bot.persistentMenus,
          greetText: bot.greetText,
          isEnabledBackBtn: bot?.isEnabledBackBtn,
          backButtonText: bot?.backButtonText
        });
      } catch (err) {
        throw new Error(err.message);
      }

      return { status: "success" };
    }

    public static async updateBot(_id, doc) {
      try {
        await validateDoc(models, doc, true);
      } catch (error) {
        throw new Error(error.message);
      }

      const {
        whatsappNumberIds,
        persistentMenus,
        greetText,
        isEnabledBackBtn,
        backButtonText
      } = doc;

      const bot = await this.getBot(_id);

      if (
        JSON.stringify({
          whatsappNumberIds,
          persistentMenus,
          greetText,
          isEnabledBackBtn,
          backButtonText
        }) !==
        JSON.stringify({
          whatsappNumberIds: bot.whatsappNumberIds,
          persistentMenus: bot.persistentMenus,
          greetText: bot.greetText,
          isEnabledBackBtn: bot.isEnabledBackBtn,
          backButtonText: bot.backButtonText
        })
      ) {
        try {
          if (whatsappNumberIds !== bot.whatsappNumberIds) {
            await this.disconnectBotPageMessenger(_id);
          }

          await this.connectBotPageMessenger({
            botId: bot._id,
            pageAccessToken: bot.token,
            persistentMenus: doc.persistentMenus,
            greetText: greetText !== bot.greetText ? greetText : undefined,
            isEnabledBackBtn: bot?.isEnabledBackBtn,
            backButtonText: bot?.backButtonText
          });
        } catch (error) {
          throw new Error(error.message);
        }
      }

      await models.Bots.updateOne({ _id }, { ...doc });
      return { status: "success" };
    }

    public static async removeBot(_id) {
      try {
        await this.disconnectBotPageMessenger(_id);
      } catch (error) {
        debugError(error.message);
      }

      await models.Bots.deleteOne({ _id });

      return { status: "success" };
    }

    static async connectBotPageMessenger({
      botId,
      pageAccessToken,
      persistentMenus,
      greetText,
      isEnabledBackBtn,
      backButtonText
    }) {
      let generatedPersistentMenus: any[] = [];

      for (const { _id, type, text, link } of persistentMenus || []) {
        if (text) {
          if (type === "link" && link) {
            generatedPersistentMenus.push({
              type: "web_url",
              title: text,
              url: link,
              webview_height_ratio: "full"
            });
          } else {
            generatedPersistentMenus.push({
              type: "postback",
              title: text,
              payload: JSON.stringify({
                botId,
                persistentMenuId: _id
              })
            });
          }
        }
      }

      if (isEnabledBackBtn) {
        generatedPersistentMenus.push({
          type: "postback",
          title: backButtonText || "Back",
          payload: JSON.stringify({
            botId,
            isBackBtn: true,
            persistentMenuId: Math.random()
          })
        });
      }

      let doc: any = {
        get_started: { payload: JSON.stringify({ botId: botId }) },
        persistent_menu: [
          {
            locale: "default",
            composer_input_disabled: false,
            call_to_actions: [
              {
                type: "postback",
                title: "Get Started",
                payload: JSON.stringify({ botId: botId })
              },
              ...generatedPersistentMenus
            ]
          }
        ]
      };

      if (greetText) {
        doc.greeting = [
          {
            locale: "default",
            text: greetText
          }
        ];
      }

      return { status: "success" };
    }

    static async disconnectBotPageMessenger(_id) {
      await models.Bots.deleteOne({ _id });

      return { status: "success" };
    }
  }

  botSchema.loadClass(Bot);
  return botSchema;
};
