import { stripHtml } from 'string-strip-html';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { conversationMessageSchema } from '@/integrations/facebook/db/definitions/conversationMessages';
import {
  IFacebookConversationMessage,
  IFacebookConversationMessageDocument,
} from '@/integrations/facebook/@types/conversationMessages';
import { pConversationClientMessageInserted } from '~/modules/inbox/graphql/resolvers/mutations/widget';
import { TBotData } from '../../meta/automation/types/automationTypes';

interface IAddFacebookConversationBotMessage {
  conversationId: string;
  botId: string;
  botData: TBotData[];
  mid: string;
  conversationErxesApiId: string;
}

const hasMeaningfulHtml = (value = '') => {
  return stripHtml(value).result.trim().length > 0;
};

const wrapParagraph = (value = '') => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return '';
  }

  return `<p>${trimmedValue}</p>`;
};

const extractBotMessageContent = (botData: TBotData[] = []) => {
  const parts: string[] = [];

  for (const item of botData) {
    if (item.type === 'text') {
      if (hasMeaningfulHtml(item.text)) {
        parts.push(item.text);
      }

      continue;
    }

    if (item.type === 'button_template') {
      if (hasMeaningfulHtml(item.text)) {
        parts.push(item.text);
      }

      const buttonTitles = item.buttons
        .map(({ title }) => title?.trim())
        .filter(Boolean);

      if (buttonTitles.length) {
        parts.push(wrapParagraph(buttonTitles.join(', ')));
      }

      continue;
    }

    if (item.type === 'quick_replies') {
      if (hasMeaningfulHtml(item.text)) {
        parts.push(item.text);
      }

      const quickReplyTitles = item.quick_replies
        .map(({ title }) => title?.trim())
        .filter(Boolean);

      if (quickReplyTitles.length) {
        parts.push(wrapParagraph(quickReplyTitles.join(', ')));
      }

      continue;
    }

    if (item.type === 'carousel') {
      for (const element of item.elements) {
        parts.push(wrapParagraph(element.title));
        parts.push(wrapParagraph(element.subtitle));

        const buttonTitles = element.buttons
          .map(({ title }) => title?.trim())
          .filter(Boolean);

        if (buttonTitles.length) {
          parts.push(wrapParagraph(buttonTitles.join(', ')));
        }
      }

      continue;
    }

    if (item.type === 'file' && item.url) {
      parts.push(wrapParagraph(item.url));
    }
  }

  return parts.filter(Boolean).join('');
};

export interface IFacebookConversationMessageModel extends Model<IFacebookConversationMessageDocument> {
  getMessage(_id: string): Promise<IFacebookConversationMessageDocument>;
  createMessage(
    doc: IFacebookConversationMessage,
  ): Promise<IFacebookConversationMessageDocument>;
  addMessage(
    doc: IFacebookConversationMessage,
    userId?: string,
  ): Promise<IFacebookConversationMessageDocument>;

  addBotMessage(
    subdomain: string,
    {
      conversationId,
      botId,
      botData,
      mid,
      conversationErxesApiId,
    }: IAddFacebookConversationBotMessage,
  ): Promise<IFacebookConversationMessageDocument>;
}

export const loadFacebookConversationMessageClass = (models: IModels) => {
  class Message {
    /**
     * Retrieves message
     */
    public static async getMessage(_id: string) {
      const message = await models.FacebookConversationMessages.findOne({
        _id,
      }).lean();

      if (!message) {
        throw new Error('Conversation message not found');
      }

      return message;
    }
    /**
     * Create a message
     */
    public static async createMessage(doc: IFacebookConversationMessage) {
      const message = await models.FacebookConversationMessages.create({
        ...doc,
        createdAt: doc.createdAt || new Date(),
      });

      return message;
    }

    /**
     * Create a conversation message
     */
    public static async addMessage(
      doc: IFacebookConversationMessageDocument,
      userId?: string,
    ) {
      const conversation = await models.FacebookConversations.findOne({
        _id: doc.conversationId,
      });

      if (!conversation) {
        throw new Error(`Conversation not found with id ${doc.conversationId}`);
      }

      const content = doc.content || '';
      const attachments = doc.attachments || [];

      doc.content = content;
      doc.attachments = attachments;

      // Determine if the content is valid
      const hasImage = content.includes('<img');
      const plainText = stripHtml(content).result.trim();
      const contentValid = hasImage || plainText.length > 0;

      if (attachments.length === 0 && !contentValid) {
        throw new Error('Content is required');
      }

      return this.createMessage({ ...doc, userId });
    }

    public static async addBotMessage(
      subdomain: string,
      {
        conversationId,
        botId,
        botData,
        mid,
        conversationErxesApiId,
      }: IAddFacebookConversationBotMessage,
    ) {
      const content = extractBotMessageContent(botData);

      const conversationMessage =
        await models.FacebookConversationMessages.addMessage({
          conversationId,
          content,
          internal: false,
          mid,
          botId,
          botData,
          fromBot: true,
        });

      pConversationClientMessageInserted(subdomain, {
        ...conversationMessage.toObject(),
        conversationId: conversationErxesApiId,
      });
      return conversationMessage;
    }
  }

  conversationMessageSchema.loadClass(Message);

  return conversationMessageSchema;
};
