import { getEnv } from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';
import { IInstagramConversationMessageDocument } from '@/integrations/instagram/@types/conversationMessages';
import { IInstagramConversation } from '@/integrations/instagram/@types/conversations';
import {
  TBotConfigMessageButton,
  TBotData,
} from '@/integrations/instagram/meta/automation/types/automationTypes';
import { sendAutomationTrigger } from 'erxes-api-shared/core-modules';

export const triggerInstagramAutomation = async (
  subdomain: string,
  {
    conversationMessage,
    payload,
    adData,
  }: {
    conversationMessage: IInstagramConversationMessageDocument;
    payload: any;
    adData?: any;
  },
) => {
  const target: any = { ...conversationMessage };
  let type = 'frontline:instagram.messages';
  let repeatOptions;
  if (payload) {
    target.payload = JSON.parse(payload || '{}');
    const { executionId, actionId, btnId } = target?.payload || {};
    if (executionId && actionId) {
      repeatOptions = { executionId, actionId, optionalConnectId: btnId };
    }
  }

  if (adData) {
    target.adData = adData;
    type = 'instagram:ads';
  }

  sendAutomationTrigger(
    subdomain,
    {
      type,
      targets: [target],
      repeatOptions,
    },
    {
      jobOptions: {
        priority: 1,
        removeOnComplete: true,
        removeOnFail: true,
      },
    },
  );
};

export const checkIsBot = async (models: IModels, message, recipientId) => {
  let selector: any = { pageId: recipientId };

  if (message?.payload) {
    const payload = JSON.parse(message?.payload || '{}');
    if (payload.botId) {
      selector = { _id: payload.botId };
    }
  }
  const bot = await models.InstagramBots.findOne(selector);

  return bot;
};

export const generatePayloadString = (
  conversation: IInstagramConversation,
  btn: any,
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
      type: 'custom',
      component: 'QuickReplies',
      quick_replies: quickReplies.map(({ text }) => ({
        title: text,
      })),
    });
  }

  if (type === 'image') {
    botData.push({
      type: 'file',
      url: getUrl(subdomain, image),
    });
  }

  if (type === 'text' && buttons?.length > 0) {
    botData.push({
      type: 'carousel',
      elements: [{ title: text, buttons: generateButtons(buttons) }],
    });
  }

  if (type === 'text') {
    botData.push({
      type: 'text',
      text: `<p>${text}</p>`,
    });
  }

  return botData;
};

type TContentCondition = {
  operator?: string;
  keywords?: { text?: string }[];
};

const matchesCondition = (content: string, condition: TContentCondition) => {
  const keywords = (condition?.keywords || [])
    .map((keyword) => keyword.text?.trim())
    .filter((keyword): keyword is string => !!keyword);

  // A rule with nothing to look for matches nothing; `every` would otherwise
  // report true on an empty list and answer every message.
  if (!keywords.length) {
    return false;
  }

  switch (condition?.operator || '') {
    case 'every':
      return keywords.every((keyword) => content.includes(keyword));
    case 'some':
      return keywords.some((keyword) => content.includes(keyword));
    case 'isEqual':
      return keywords.some((keyword) => keyword === content);
    case 'isContains':
      // Was a RegExp compiled from the keyword, which threw on any rule
      // holding a bracket or a plus. Stays case-insensitive as it was.
      return keywords.some((keyword) =>
        content.toLowerCase().includes(keyword.toLowerCase()),
      );
    case 'startWith':
      return keywords.some((keyword) => content.startsWith(keyword));
    case 'endWith':
      return keywords.some((keyword) => content.endsWith(keyword));
    default:
      return false;
  }
};

/**
 * Conditions widen the match: each one is another way for the same trigger to
 * answer, so any of them matching is enough.
 */
export const checkContentConditions = (
  content: string,
  conditions: TContentCondition[],
) =>
  (conditions || []).some((condition) => matchesCondition(content, condition));

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

  if (!target?.adData) {
    return false;
  }

  const { adId, pageId } = target.adData;

  const models = await generateModels(subdomain);

  const bot = await models.InstagramBots.findOne(
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
