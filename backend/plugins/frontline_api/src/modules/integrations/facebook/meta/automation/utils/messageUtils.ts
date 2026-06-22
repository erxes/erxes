import { getEnv } from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';
import { IFacebookConversationMessageDocument } from '@/integrations/facebook/@types/conversationMessages';
import { IFacebookConversation } from '@/integrations/facebook/@types/conversations';
import {
  TBotConfigMessageAttachment,
  TBotConfigMessageButton,
  TBotData,
} from '@/integrations/facebook/meta/automation/types/automationTypes';
import { sendAutomationTrigger } from 'erxes-api-shared/core-modules';

type TFacebookAutomationPayload = {
  executionId?: string;
  actionId?: string;
  btnId?: string;
  botId?: string;
  isBackBtn?: boolean;
  persistentMenuId?: string;
  persistentMenuType?: string;
};

type TFacebookOpenThreadAdData = {
  source?: string;
  type?: string;
  adId?: string;
  postId?: string;
  pageId?: string;
};

type TFacebookAutomationTarget =
  Partial<IFacebookConversationMessageDocument> & {
    payload?: TFacebookAutomationPayload;
    entryType?: 'direct' | 'open_thread';
    adData?: TFacebookOpenThreadAdData;
    openThread?: {
      source: string;
      type: string;
      adId?: string;
      postId?: string;
      pageId?: string;
    };
  };

type TContentCondition = {
  operator?: string;
  keywords?: { text?: string }[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const getStringValue = (value: unknown) =>
  typeof value === 'string' ? value : undefined;

const getBooleanValue = (value: unknown) =>
  typeof value === 'boolean' ? value : undefined;

export const parseAutomationPayload = (
  payload?: string,
): TFacebookAutomationPayload => {
  if (!payload) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(payload);

    if (!isRecord(parsed)) {
      return {};
    }

    return {
      executionId: getStringValue(parsed.executionId),
      actionId: getStringValue(parsed.actionId),
      btnId: getStringValue(parsed.btnId),
      botId: getStringValue(parsed.botId),
      isBackBtn: getBooleanValue(parsed.isBackBtn),
      persistentMenuId: getStringValue(parsed.persistentMenuId),
      persistentMenuType: getStringValue(parsed.persistentMenuType),
    };
  } catch {
    return {};
  }
};

export const triggerFacebookMessageAutomation = (
  subdomain: string,
  {
    conversationMessage,
    payload,
    adData,
  }: {
    conversationMessage: IFacebookConversationMessageDocument;
    payload?: string;
    adData?: TFacebookOpenThreadAdData;
  },
) => {
  if (conversationMessage.fromBot || conversationMessage.internal) {
    return;
  }

  const target: TFacebookAutomationTarget = { ...conversationMessage };
  let repeatOptions;

  if (payload) {
    target.payload = parseAutomationPayload(payload);
    const { executionId, actionId, btnId } = target?.payload || {};

    if (executionId && actionId) {
      repeatOptions = { executionId, actionId, optionalConnectId: btnId };
    }
  }

  if (adData) {
    target.entryType = 'open_thread';
    target.adData = adData;
    target.openThread = {
      source: adData?.source || 'ADS',
      type: adData?.type || 'OPEN_THREAD',
      adId: adData?.adId,
      postId: adData?.postId,
      pageId: adData?.pageId,
    };
  } else {
    target.entryType = 'direct';
  }

  sendAutomationTrigger(
    subdomain,
    {
      type: 'frontline:facebook.messages',
      targets: [target],
      repeatOptions,
    },
    { transport: 'trpc' },
  );
};

export const checkIsBot = async (
  models: IModels,
  message: { payload?: string } | undefined,
  recipientId: string,
) => {
  let selector: { pageId: string } | { _id: string } = { pageId: recipientId };

  if (message?.payload) {
    const payload = parseAutomationPayload(message.payload);
    if (payload.botId) {
      selector = { _id: payload.botId };
    }
  }
  const bot = await models.FacebookBots.findOne(selector);

  return bot;
};

export const generatePayloadString = (
  conversation: IFacebookConversation,
  btn: { _id: string },
  customerId: string,
  executionId: string,
  actionId: string,
) => {
  return JSON.stringify({
    btnId: btn._id,
    conversationId: conversation._id,
    customerId,
    executionId,
    actionId,
  });
};

export const generateBotData = (
  subdomain: string,
  {
    type,
    buttons,
    text,
    cards,
    quickReplies,
    image,
    video,
    audio,
    attachments,
  }: {
    type: string;
    buttons: TBotConfigMessageButton[];
    text: string;
    cards: {
      _id: string;
      title: string;
      subtitle: string;
      label: string;
      image: string;
      buttons: TBotConfigMessageButton[];
    }[];
    quickReplies: {
      _id: string;
      text: string;
      image_url?: string;
    }[];
    image: string;
    video?: string;
    audio?: string;
    attachments?: TBotConfigMessageAttachment[];
  },
) => {
  const botData: TBotData[] = [];

  const generateButtons = (buttons: TBotConfigMessageButton[]) => {
    return buttons.map((btn) => ({
      title: btn.text,
      url: btn.link || null,
      type: btn.link ? 'openUrl' : null,
    }));
  };

  if (type === 'card') {
    botData.push({
      type: 'carousel',
      elements: cards.map(
        ({
          title = '',
          subtitle = '',
          image = '',
          buttons: cardButtons = [],
        }) => ({
          picture: getUrl(subdomain, image),
          title,
          subtitle,
          buttons: generateButtons(cardButtons),
        }),
      ),
    });
  }

  if (type === 'quickReplies') {
    botData.push({
      type: 'quick_replies',
      text: `<p>${text}</p>`,
      quick_replies: quickReplies.map(({ text }) => ({
        title: text,
      })),
    });
  }

  const mediaUrls =
    type === 'image'
      ? [image]
      : type === 'video'
      ? [video || '']
      : type === 'audio'
      ? [audio || '']
      : type === 'attachments'
      ? (attachments || []).map(({ url }) => url)
      : [];

  for (const mediaUrl of mediaUrls.filter(Boolean)) {
    botData.push({
      type: 'file',
      url: getUrl(subdomain, mediaUrl),
    });
  }

  if (['text', 'input'].includes(type) && buttons?.length > 0) {
    botData.push({
      type: 'button_template',
      text: `<p>${text}</p>`,
      buttons: generateButtons(buttons),
    });
  } else if (['text', 'input'].includes(type)) {
    botData.push({
      type: 'text',
      text: `<p>${text}</p>`,
    });
  }

  return botData;
};

export const checkContentConditions = (
  content: string,
  conditions: TContentCondition[],
) => {
  for (const cond of conditions || []) {
    const keywords = (cond?.keywords || [])
      .map((keyword) => keyword.text)
      .filter((keyword): keyword is string => !!keyword);

    switch (cond?.operator || '') {
      case 'every':
        return keywords.every((keyword) => content.includes(keyword));
      case 'some':
        return keywords.some((keyword) => content.includes(keyword));
      case 'isEqual':
        return keywords.some((keyword) => keyword === content);
      case 'isContains':
        return keywords.some((keyword) =>
          content.match(new RegExp(keyword, 'i')),
        );
      case 'startWith':
        return keywords.some((keyword) => content.startsWith(keyword));
      case 'endWith':
        return keywords.some((keyword) => content.endsWith(keyword));
      default:
        return;
    }
  }
};

export const getUrl = (subdomain, key) => {
  const DOMAIN = getEnv({
    name: 'DOMAIN',
    subdomain,
  });

  const NODE_ENV = getEnv({ name: 'NODE_ENV' });
  const VERSION = getEnv({ name: 'VERSION' });

  if (NODE_ENV !== 'production') {
    return `${DOMAIN}/read-file?key=${key}`;
  }

  if (VERSION === 'saas') {
    return `${DOMAIN}/api/read-file?key=${key}`;
  }

  return `${DOMAIN}/gateway/read-file?key=${key}`;
};

export const checkAdsTrigger = async (subdomain, { target, config }) => {
  const { botId, adsType, adIds = [], checkContent, conditions } = config || {};

  const adData = target?.adData;

  if (!adData) {
    return false;
  }

  const { adId, pageId } = adData;

  const models = await generateModels(subdomain);

  const bot = await models.FacebookBots.findOne(
    {
      _id: botId,
      pageId,
    },
    { _id: 1 },
  ).lean();

  if (!bot) {
    return;
  }

  if (adsType === 'specific' && !adIds.includes(adId)) {
    return false;
  }

  return !checkContent
    ? true
    : checkContentConditions(target?.content || '', conditions);
};
