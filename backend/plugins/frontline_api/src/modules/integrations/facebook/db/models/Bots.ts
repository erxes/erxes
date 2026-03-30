import { SUBSCRIBED_FIELDS } from '@/integrations/facebook/constants';
import {
  getPageAccessToken,
  graphRequest,
} from '@/integrations/facebook/utils';
import { sendNotification } from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IFacebookBotDocument, facebookBotSchema } from '../definitions/bots';

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

type TBotHealthStatus = 'healthy' | 'degraded' | 'broken' | 'syncing';

type TBotActorContext = {
  userId: string;
};

type TSetBotHealthInput = {
  status: TBotHealthStatus;
  reason?: string;
  accountId?: string;
  token?: string;
  isSubscribed?: boolean;
  isProfileSynced?: boolean;
  userId?: string;
  notify?: boolean;
};

const generateBotHealthUpdate = ({
  status,
  reason,
  accountId,
  token,
  isSubscribed,
  isProfileSynced,
  userId,
}: Omit<TSetBotHealthInput, 'notify'>) => {
  const now = new Date();
  const set: Record<string, any> = {
    'health.status': status,
    'health.lastVerifiedAt': now,
    updatedAt: now,
  };

  if (typeof isSubscribed === 'boolean') {
    set['health.isSubscribed'] = isSubscribed;
  }

  if (typeof isProfileSynced === 'boolean') {
    set['health.isProfileSynced'] = isProfileSynced;
  }

  if (accountId) {
    set.accountId = accountId;
  }

  if (token) {
    set.token = token;
  }

  if (userId) {
    set.updatedBy = userId;
  }

  if (status === 'healthy') {
    set['health.lastSyncedAt'] = now;
    set['health.lastError'] = '';
  }

  if (status === 'syncing') {
    set['health.lastError'] = '';
  }

  if (status === 'broken' || status === 'degraded') {
    set['health.lastError'] = reason || 'Bot health check failed';
  }

  return { $set: set };
};

export interface IFacebookBotModel extends Model<IFacebookBotDocument> {
  addBot(doc: any, options: TBotActorContext): Promise<IFacebookBotDocument>;
  updateBot(
    _id: string,
    doc: any,
    options: TBotActorContext,
  ): Promise<IFacebookBotDocument>;
  removeBot(_id: string): Promise<{ status: 'success' }>;
  repair(
    _id: string,
    options: TBotActorContext,
  ): Promise<{ status: 'success' }>;
  markBrokenByAccount(
    accountId: string,
    options: { reason: string; userId?: string; notify?: boolean },
  ): Promise<void>;
  markBrokenByPageIds(
    pageIds: string[],
    options: { reason: string; userId?: string; notify?: boolean },
  ): Promise<void>;
  reviveByPageId(input: {
    pageId: string;
    accountId: string;
    token: string;
    userId?: string;
    notify?: boolean;
  }): Promise<IFacebookBotDocument | null>;
  updatePageToken(
    pageId: string,
    token: string,
    options?: { userId?: string },
  ): Promise<void>;
}

export const loadFacebookBotClass = (models: IModels, subdomain: string) => {
  class FacebookBot {
    // Shared lookup used by the bot lifecycle methods below.
    static async getBot(_id) {
      const bot = await models.FacebookBots.findOne({ _id });

      if (!bot) {
        throw new Error('Not found');
      }
      return bot;
    }

    static async sendHealthChangeNotification(
      botId: string,
      {
        status,
        reason,
      }: {
        status: 'healthy' | 'degraded' | 'broken';
        reason?: string;
      },
    ) {
      const bot = await this.getBot(botId);
      const recipientIds = Array.from(
        new Set([bot.createdBy, bot.updatedBy].filter(Boolean)),
      ) as string[];

      if (!recipientIds.length) {
        return;
      }

      await sendNotification(subdomain, {
        title:
          status === 'healthy'
            ? 'Facebook bot restored'
            : 'Facebook bot unhealthy',
        message:
          status === 'healthy'
            ? `${bot.name} is healthy again`
            : `${bot.name} became unavailable. ${reason || ''}`.trim(),
        type: status === 'healthy' ? 'success' : 'warning',
        priority: 'medium',
        userIds: recipientIds,
        kind: 'system',
        contentType: 'frontline:facebookBot.health',
        content: bot.name,
        metadata: {
          botId: bot._id,
          pageId: bot.pageId,
          status,
          reason,
        },
      });
    }

    static async setBotHealth(botId: string, input: TSetBotHealthInput) {
      const bot = await this.getBot(botId);
      const previousStatus = bot.health?.status;
      const update = generateBotHealthUpdate(input);

      await models.FacebookBots.updateOne({ _id: botId }, update);

      const isNotificationEnabled = input.notify !== false;
      const statusChanged = previousStatus !== input.status;
      const becameHealthy = input.status === 'healthy';
      const becameDegraded = input.status === 'degraded';
      const becameBroken = input.status === 'broken';
      const becameUnhealthy = becameDegraded || becameBroken;
      const isNotifiableStatus = becameHealthy || becameUnhealthy;
      const shouldNotify =
        isNotificationEnabled && statusChanged && isNotifiableStatus;

      if (shouldNotify) {
        await this.sendHealthChangeNotification(botId, {
          status: input.status as 'healthy' | 'degraded' | 'broken',
          reason: input.reason,
        });
      }

      return this.getBot(botId);
    }

    static async markSyncing(
      botId: string,
      { userId }: { userId?: string } = {},
    ) {
      await models.FacebookBots.updateOne(
        { _id: botId },
        generateBotHealthUpdate({
          status: 'syncing',
          userId,
        }),
      );
    }

    static async markHealthy(
      botId: string,
      {
        isSubscribed = true,
        isProfileSynced = true,
        userId,
        notify = false,
      }: {
        isSubscribed?: boolean;
        isProfileSynced?: boolean;
        userId?: string;
        notify?: boolean;
      } = {},
    ) {
      return this.setBotHealth(botId, {
        status: 'healthy',
        isSubscribed,
        isProfileSynced,
        userId,
        notify,
      });
    }

    static async markDegraded(
      botId: string,
      {
        isSubscribed = false,
        isProfileSynced = false,
        error,
        userId,
        notify = false,
      }: {
        isSubscribed?: boolean;
        isProfileSynced?: boolean;
        error?: string;
        userId?: string;
        notify?: boolean;
      } = {},
    ) {
      return this.setBotHealth(botId, {
        status: 'degraded',
        reason: error,
        isSubscribed,
        isProfileSynced,
        userId,
        notify,
      });
    }

    static async markBroken(
      botId: string,
      {
        reason,
        userId,
        notify = true,
      }: {
        reason: string;
        userId?: string;
        notify?: boolean;
      },
    ) {
      return this.setBotHealth(botId, {
        status: 'broken',
        reason,
        isSubscribed: false,
        isProfileSynced: false,
        userId,
        notify,
      });
    }

    static async markBrokenByAccount(
      accountId: string,
      {
        reason,
        userId,
        notify = true,
      }: {
        reason: string;
        userId?: string;
        notify?: boolean;
      },
    ) {
      const bots = await models.FacebookBots.find({ accountId }).lean();

      for (const bot of bots) {
        await this.markBroken(bot._id, { reason, userId, notify });
      }
    }

    static async markBrokenByPageIds(
      pageIds: string[],
      {
        reason,
        userId,
        notify = true,
      }: {
        reason: string;
        userId?: string;
        notify?: boolean;
      },
    ) {
      const bots = await models.FacebookBots.find({
        pageId: { $in: pageIds },
      }).lean();

      for (const bot of bots) {
        await this.markBroken(bot._id, { reason, userId, notify });
      }
    }

    static async reviveByPageId({
      pageId,
      accountId,
      token,
      userId,
      notify = true,
    }: {
      pageId: string;
      accountId: string;
      token: string;
      userId?: string;
      notify?: boolean;
    }) {
      const bot = await models.FacebookBots.findOne({ pageId });

      if (!bot) {
        return null;
      }

      return this.setBotHealth(bot._id, {
        status: 'healthy',
        accountId,
        token,
        isSubscribed: true,
        isProfileSynced: true,
        userId,
        notify,
      });
    }

    static async updatePageToken(
      pageId: string,
      token: string,
      { userId }: { userId?: string } = {},
    ) {
      await models.FacebookBots.updateOne(
        { pageId },
        {
          $set: {
            token,
            updatedAt: new Date(),
            ...(userId ? { updatedBy: userId } : {}),
          },
        },
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

    static hasRequiredSubscribedFields(subscribedData: any[] = []) {
      const subscribedFields = subscribedData.flatMap(
        (item) => item?.subscribed_fields || [],
      );

      return SUBSCRIBED_FIELDS.every((field) =>
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

    public static async addBot(doc, { userId }: TBotActorContext) {
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

      const now = new Date();

      const bot = await models.FacebookBots.create({
        ...doc,
        uid: account.uid,
        token: pageTokenResponse,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId,
      });

      await this.markSyncing(bot._id, { userId });

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

    public static async repair(_id, { userId }: TBotActorContext) {
      const bot = await this.getBot(_id);
      const previousHealthStatus = bot.health?.status;
      const shouldNotifyRevived =
        previousHealthStatus === 'broken' ||
        previousHealthStatus === 'degraded';

      await this.markSyncing(bot._id, { userId });

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

        await this.setBotHealth(bot._id, {
          status: 'healthy',
          accountId: bot.accountId,
          token: bot.token,
          isSubscribed: true,
          isProfileSynced: true,
          userId,
          notify: false,
        });

        if (shouldNotifyRevived) {
          await this.sendHealthChangeNotification(bot._id, {
            status: 'healthy',
          });
        }
      } catch (err) {
        await this.markBroken(bot._id, {
          reason: err.message,
          userId,
          notify: true,
        });
        throw new Error(err.message);
      }

      return { status: 'success' };
    }

    public static async updateBot(_id, doc, { userId }: TBotActorContext) {
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
      const previousHealthStatus = bot.health?.status;
      const shouldNotifyRevived =
        previousHealthStatus === 'broken' ||
        previousHealthStatus === 'degraded';

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
          await this.markSyncing(bot._id, { userId });

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

          await this.setBotHealth(bot._id, {
            status: 'healthy',
            isSubscribed: true,
            isProfileSynced: true,
            userId,
            notify: false,
          });

          if (shouldNotifyRevived) {
            await this.sendHealthChangeNotification(bot._id, {
              status: 'healthy',
            });
          }
        } catch (error) {
          await this.markDegraded(bot._id, {
            error: error.message,
            userId,
            notify: true,
          });
          throw new Error(error.message);
        }
      }

      await models.FacebookBots.updateOne(
        { _id },
        {
          $set: {
            ...doc,
            updatedAt: new Date(),
            updatedBy: userId,
          },
        },
      );
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
        const fields = ['get_started', 'persistent_menu'];

        if (!!bot.greetText) {
          fields.push('greeting');
        }

        await graphRequest.delete('/me/messenger_profile', pageAccessToken, {
          fields,
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
