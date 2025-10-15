import { getEnv, sendWorkerQueue } from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';
import { IFacebookConversationMessageDocument } from '@/integrations/facebook/@types/conversationMessages';
import { IFacebookConversation } from '@/integrations/facebook/@types/conversations';
import {
  TBotConfigMessageButton,
  TBotData,
} from '@/integrations/facebook/meta/automation/types/automationTypes';

export const triggerFacebookAutomation = async (
  subdomain: string,
  {
    conversationMessage,
    payload,
    adData,
  }: {
    conversationMessage: IFacebookConversationMessageDocument;
    payload: any;
    adData: any;
  },
) => {
  const target: any = { ...conversationMessage };
  let executionId;
  let type = 'frontline:facebook.messages';

  if (payload) {
    target.payload = JSON.parse(payload || '{}');
    if (target?.payload?.executionId) {
      executionId = target.payload.executionId;
    }
  }

  if (adData) {
    target.adData = adData;
    type = 'facebook:ads';
  }

  sendWorkerQueue('automations', 'trigger').add('trigger', {
    subdomain,
    data: { type, targets: [target], executionId },
  });
};

export const checkIsBot = async (models: IModels, message, recipientId) => {
  let selector: any = { pageId: recipientId };

  if (message?.payload) {
    const payload = JSON.parse(message?.payload || '{}');
    if (payload.botId) {
      selector = { _id: payload.botId };
    }
  }

  const bot = await models.FacebookBots.findOne(selector);

  return bot;
};

export const generatePayloadString = (
  conversation: IFacebookConversation,
  btn: any,
  customerId: string,
  executionId: string,
) => {
  return JSON.stringify({
    btnId: btn._id,
    conversationId: conversation._id,
    customerId,
    executionId,
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
  let botData: TBotData[] = [];

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

  const { adId, pageId } = target?.adData;

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
