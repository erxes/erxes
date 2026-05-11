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
    // payload comes from a webhook body and may be malformed; guard the
    // JSON.parse so a bad payload cannot crash checkIsBot. Fall back to
    // the default pageId-only selector when parsing fails.
    let payload: { botId?: unknown } = {};
    try {
      payload = JSON.parse(message.payload);
    } catch {
      // Invalid JSON payload, proceed with the default selector.
    }
    // Coerce/validate botId to a string before using it in the query.
    // payload.botId could be a Mongo operator object (e.g. {$ne: null}) and
    // would turn the lookup into NoSQL injection. Keep pageId scope to
    // prevent cross-page bot lookups even when a string bot id is supplied.
    if (typeof payload.botId === 'string' && payload.botId) {
      selector = { _id: payload.botId, pageId: recipientId };
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

export const checkContentConditions = (content: string, conditions: any[]) => {
  for (const cond of conditions || []) {
    const keywords = (cond?.keywords || [])
      .map((keyword) => keyword.text)
      .filter((keyword) => keyword);

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
