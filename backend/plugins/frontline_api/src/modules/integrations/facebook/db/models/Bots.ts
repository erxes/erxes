import { Model } from 'mongoose';
import { IFacebookBotDocument, facebookBotSchema } from '../definitions/bots';
import {
  getPageAccessToken,
  graphRequest,
} from '@/integrations/facebook/utils';
import { IModels } from '~/connectionResolvers';
import {
  BOT_SUBSCRIBE_FIELDS,
  SUBSCRIBED_FIELDS,
} from '@/integrations/facebook/constants';

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

const FACEBOOK_BOT_HEALTH_CHECKS = {
  IS_SUBSCRIBED: 'isSubscribed',
  HAS_VALID_GET_STARTED: 'hasValidGetStarted',
  HAS_VALID_PERSISTENT_MENU: 'hasValidPersistentMenu',
  HAS_VALID_GREETING: 'hasValidGreeting',
} as const;

const FACEBOOK_BOT_HEALTH_MESSAGES = {
  [FACEBOOK_BOT_HEALTH_CHECKS.IS_SUBSCRIBED]:
    'Facebook subscriptions are missing',
  [FACEBOOK_BOT_HEALTH_CHECKS.HAS_VALID_GET_STARTED]:
    'Get Started is out of sync',
  [FACEBOOK_BOT_HEALTH_CHECKS.HAS_VALID_PERSISTENT_MENU]:
    'Persistent menu is out of sync',
  [FACEBOOK_BOT_HEALTH_CHECKS.HAS_VALID_GREETING]:
    'Greeting text is out of sync',
} as const;

export interface IFacebookBotModel extends Model<IFacebookBotDocument> {
  addBot(doc: any): Promise<IFacebookBotDocument>;
  updateBot(_id: string, doc: any): Promise<IFacebookBotDocument>;
  removeBot(_id: string): Promise<IFacebookBotDocument>;
  repair(_id: string): Promise<IFacebookBotDocument>;
}

export const loadFacebookBotClass = (models: IModels) => {
  class FacebookBot {
    // Shared lookup used by the bot lifecycle methods below.
    static async getBot(_id) {
      const bot = await models.FacebookBots.findOne({ _id });

      if (!bot) {
        throw new Error('Not found');
      }
      return bot;
    }

    // Internal health helpers keep sync/verify state updates consistent.
    static buildHealthUpdate(health: Record<string, any>) {
      return {
        $set: Object.entries(health).reduce((acc, [key, value]) => {
          acc[`health.${key}`] = value;
          return acc;
        }, {} as Record<string, any>),
      };
    }

    static async markSyncing(botId: string) {
      await models.FacebookBots.updateOne(
        { _id: botId },
        this.buildHealthUpdate({
          status: 'syncing',
          lastError: '',
        }),
      );
    }

    static async markHealthy(
      botId: string,
      {
        isSubscribed = true,
        isProfileSynced = true,
      }: {
        isSubscribed?: boolean;
        isProfileSynced?: boolean;
      } = {},
    ) {
      const now = new Date();

      await models.FacebookBots.updateOne(
        { _id: botId },
        this.buildHealthUpdate({
          status: 'healthy',
          isSubscribed,
          isProfileSynced,
          lastSyncedAt: now,
          lastVerifiedAt: now,
          lastError: '',
        }),
      );
    }

    static async markDegraded(
      botId: string,
      {
        isSubscribed = false,
        isProfileSynced = false,
        error,
      }: {
        isSubscribed?: boolean;
        isProfileSynced?: boolean;
        error?: string;
      } = {},
    ) {
      await models.FacebookBots.updateOne(
        { _id: botId },
        this.buildHealthUpdate({
          status: 'degraded',
          isSubscribed,
          isProfileSynced,
          lastVerifiedAt: new Date(),
          lastError: error || 'Bot health check failed',
        }),
      );
    }

    static buildExpectedPersistentMenus({
      botId,
      persistentMenus,
      isEnabledBackBtn,
      backButtonText,
    }: {
      botId: string;
      persistentMenus?: Array<{
        _id: string;
        type: string;
        text: string;
        link?: string;
      }>;
      isEnabledBackBtn?: boolean;
      backButtonText?: string;
    }) {
      const expectedMenus: any[] = [
        {
          type: 'postback',
          title: 'Get Started',
          payload: JSON.stringify({ botId }),
        },
      ];

      for (const { _id, type, text, link } of persistentMenus || []) {
        if (!text) {
          continue;
        }

        if (type === 'link' && link) {
          expectedMenus.push({
            type: 'web_url',
            title: text,
            url: link,
          });
          continue;
        }

        expectedMenus.push({
          type: 'postback',
          title: text,
          payload: JSON.stringify({
            botId,
            persistentMenuId: _id,
          }),
        });
      }

      if (isEnabledBackBtn) {
        expectedMenus.push({
          type: 'postback',
          title: backButtonText || 'Back',
          isBackButton: true,
        });
      }

      return expectedMenus;
    }

    static normalizePersistentMenuItem(menu: any) {
      return {
        type: menu?.type || '',
        title: menu?.title || '',
        url: menu?.url || '',
        payload: menu?.payload || '',
      };
    }

    static getRequiredSubscribedFields() {
      return ['messages', ...BOT_SUBSCRIBE_FIELDS];
    }

    static hasRequiredSubscribedFields(subscribedData: any[] = []) {
      const subscribedFields = subscribedData.flatMap(
        (item) => item?.subscribed_fields || [],
      );

      return this.getRequiredSubscribedFields().every((field) =>
        subscribedFields.includes(field),
      );
    }

    static hasValidGetStartedPayload(botId: string, profileData: any) {
      const expectedPayload = JSON.stringify({ botId });
      const actualPayload = profileData?.get_started?.payload || '';

      return actualPayload === expectedPayload;
    }

    static hasValidGreeting(greetText: string | undefined, profileData: any) {
      if (!greetText) {
        return true;
      }

      return (profileData?.greeting || []).some(
        (item) => item?.text === greetText,
      );
    }

    static hasValidPersistentMenus(
      bot: Partial<IFacebookBotDocument>,
      profileData: any,
    ) {
      const actualPersistentMenus =
        profileData?.persistent_menu?.[0]?.call_to_actions || [];
      const expectedPersistentMenus = this.buildExpectedPersistentMenus({
        botId: bot._id as string,
        persistentMenus: bot.persistentMenus,
        isEnabledBackBtn: bot.isEnabledBackBtn,
        backButtonText: bot.backButtonText,
      });
      const normalizedActualMenus = actualPersistentMenus.map((menu) =>
        this.normalizePersistentMenuItem(menu),
      );

      return (
        expectedPersistentMenus.length === normalizedActualMenus.length &&
        expectedPersistentMenus.every((expectedMenu, index) =>
          this.isExpectedMenuMatched(
            expectedMenu,
            normalizedActualMenus[index],
          ),
        )
      );
    }

    static async fetchBotProfileState(pageAccessToken: string) {
      const subscribedApps: any = await graphRequest.get(
        '/me/subscribed_apps',
        pageAccessToken,
      );

      const messengerProfile: any = await graphRequest.get(
        '/me/messenger_profile?fields=get_started,persistent_menu,greeting',
        pageAccessToken,
      );

      const rawProfileData = messengerProfile || {};
      const profileData = rawProfileData?.data?.[0] || rawProfileData;

      return {
        subscribedData: subscribedApps?.data || [],
        profileData,
        rawProfileData,
      };
    }

    static buildVerificationResult({
      subscribedData,
      profileData,
      bot,
    }: {
      subscribedData: any[];
      profileData: any;
      bot: Partial<IFacebookBotDocument>;
    }) {
      const isSubscribed = this.hasRequiredSubscribedFields(subscribedData);
      const hasValidGetStarted = this.hasValidGetStartedPayload(
        bot._id as string,
        profileData,
      );
      const hasValidPersistentMenu = this.hasValidPersistentMenus(
        bot,
        profileData,
      );
      const hasValidGreeting = this.hasValidGreeting(
        bot.greetText,
        profileData,
      );

      const checks = {
        [FACEBOOK_BOT_HEALTH_CHECKS.IS_SUBSCRIBED]: isSubscribed,
        [FACEBOOK_BOT_HEALTH_CHECKS.HAS_VALID_GET_STARTED]: hasValidGetStarted,
        [FACEBOOK_BOT_HEALTH_CHECKS.HAS_VALID_PERSISTENT_MENU]:
          hasValidPersistentMenu,
        [FACEBOOK_BOT_HEALTH_CHECKS.HAS_VALID_GREETING]: hasValidGreeting,
      };

      const failedChecks = Object.entries(checks)
        .filter(([, passed]) => !passed)
        .map(([name]) => name);

      const isProfileSynced =
        hasValidGetStarted && hasValidPersistentMenu && hasValidGreeting;

      return {
        checks,
        failedChecks,
        isProfileSynced,
        isHealthy: isSubscribed && isProfileSynced,
      };
    }

    static getVerificationErrorMessage(failedChecks: string[] = []) {
      const messages = failedChecks.map(
        (check) =>
          FACEBOOK_BOT_HEALTH_MESSAGES[
            check as keyof typeof FACEBOOK_BOT_HEALTH_MESSAGES
          ] || 'Bot profile verification failed',
      );

      return messages.join('. ');
    }

    static isExpectedMenuMatched(expected: any, actual: any) {
      if (!actual) {
        return false;
      }

      if (expected.type !== actual.type) {
        return false;
      }

      if (expected.title !== actual.title) {
        return false;
      }

      if (expected.type === 'web_url') {
        return expected.url === actual.url;
      }

      if (expected.isBackButton) {
        try {
          const parsed = JSON.parse(actual.payload || '{}');
          return parsed.botId && parsed.isBackBtn === true;
        } catch {
          return false;
        }
      }

      return expected.payload === actual.payload;
    }

    static async verifyBotProfile(
      botId: string,
      {
        expectedState,
        persistFailure = true,
      }: {
        expectedState?: Partial<IFacebookBotDocument>;
        persistFailure?: boolean;
      } = {},
    ) {
      const currentBot = await this.getBot(botId);
      const bot = {
        ...currentBot.toObject(),
        ...(expectedState || {}),
      };

      const pageAccessToken = bot.token || '';
      const { subscribedData, profileData, rawProfileData } =
        await this.fetchBotProfileState(pageAccessToken);
      const verification = this.buildVerificationResult({
        subscribedData,
        profileData,
        bot,
      });

      if (verification.isHealthy) {
        await this.markHealthy(botId, {
          isSubscribed:
            verification.checks[FACEBOOK_BOT_HEALTH_CHECKS.IS_SUBSCRIBED],
          isProfileSynced: verification.isProfileSynced,
        });
      } else if (persistFailure) {
        const errorMessage = this.getVerificationErrorMessage(
          verification.failedChecks,
        );
        await this.markDegraded(botId, {
          isSubscribed:
            verification.checks[FACEBOOK_BOT_HEALTH_CHECKS.IS_SUBSCRIBED],
          isProfileSynced: verification.isProfileSynced,
          error: errorMessage,
        });
      }

      return {
        ...verification,
        profileData,
        subscribedData,
      };
    }

    static async syncAndVerifyBotProfile({
      botId,
      pageAccessToken,
      persistentMenus,
      greetText,
      isEnabledBackBtn,
      backButtonText,
      expectedState,
    }: {
      botId: string;
      pageAccessToken: string;
      persistentMenus?: IFacebookBotDocument['persistentMenus'];
      greetText?: string;
      isEnabledBackBtn?: boolean;
      backButtonText?: string;
      expectedState?: Partial<IFacebookBotDocument>;
    }) {
      await this.connectBotPageMessenger({
        botId,
        pageAccessToken,
        persistentMenus,
        greetText,
        isEnabledBackBtn,
        backButtonText,
      });

      const verification = await this.verifyBotProfile(botId, {
        expectedState,
        persistFailure: true,
      });

      if (verification.isHealthy) {
        return verification;
      }

      throw new Error(
        this.getVerificationErrorMessage(verification.failedChecks || []) ||
          'Bot profile verification failed',
      );
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

      await this.markSyncing(bot._id);

      try {
        await this.syncAndVerifyBotProfile({
          pageAccessToken: bot.token,
          botId: bot._id,
          persistentMenus: bot.persistentMenus,
          greetText: bot?.greetText,
          isEnabledBackBtn: bot?.isEnabledBackBtn,
          backButtonText: bot?.backButtonText,
          expectedState: {
            token: bot.token,
            persistentMenus: bot.persistentMenus,
            greetText: bot.greetText,
            isEnabledBackBtn: bot.isEnabledBackBtn,
            backButtonText: bot.backButtonText,
          },
        });

        return await this.getBot(bot._id);
      } catch (error) {
        await models.FacebookBots.deleteOne({ _id: bot._id });

        throw new Error(error.message);
      }
    }

    public static async repair(_id) {
      const bot = await this.getBot(_id);

      await this.markSyncing(bot._id);

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
        await this.syncAndVerifyBotProfile({
          botId: bot._id,
          pageAccessToken: bot.token,
          persistentMenus: bot.persistentMenus,
          greetText: bot.greetText,
          isEnabledBackBtn: bot?.isEnabledBackBtn,
          backButtonText: bot?.backButtonText,
          expectedState: {
            token: bot.token,
            persistentMenus: bot.persistentMenus,
            greetText: bot.greetText,
            isEnabledBackBtn: bot.isEnabledBackBtn,
            backButtonText: bot.backButtonText,
          },
        });
      } catch (err) {
        await this.markDegraded(bot._id, {
          error: err.message,
        });
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
          await this.markSyncing(bot._id);

          if (pageId !== bot.pageId) {
            await this.disconnectBotPageMessenger(_id);
          }

          await this.syncAndVerifyBotProfile({
            botId: bot._id,
            pageAccessToken: bot.token,
            persistentMenus,
            greetText: greetText !== bot.greetText ? greetText : undefined,
            isEnabledBackBtn,
            backButtonText,
            expectedState: {
              token: bot.token,
              persistentMenus,
              greetText,
              isEnabledBackBtn,
              backButtonText,
            },
          });
        } catch (error) {
          await this.markDegraded(bot._id, {
            error: error.message,
          });
          throw new Error(error.message);
        }
      }

      await models.FacebookBots.updateOne({ _id }, { ...doc });
      return await this.getBot(_id);
    }

    public static async removeBot(_id) {
      await this.disconnectBotPageMessenger(_id);

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
        subscribed_fields: ['messages', ...BOT_SUBSCRIBE_FIELDS],
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

      await this.markSyncing(bot._id);

      try {
        await graphRequest.delete('/me/messenger_profile', pageAccessToken, {
          fields: ['get_started', 'persistent_menu', 'greeting'],
          access_token: pageAccessToken,
        });

        return { status: 'success' };
      } catch (error) {
        await this.markDegraded(bot._id, {
          error: error.message,
        });

        throw new Error(error.message);
      }
    }
  }

  facebookBotSchema.loadClass(FacebookBot);
  return facebookBotSchema;
};
