import { Model, Document, Schema } from 'mongoose';
import * as strip from 'strip';
import { attachmentSchema } from '@erxes/api-utils/src/definitions/common';
import { IModels } from '.';
import { field } from './definitions/utils';

export interface IConversationMessage {
  mid: string;
  conversationId: string;
  content: string;
  // from inbox
  createdAt?: Date;
  attachments?: [];
  customerId?: string;
  visitorId?: string;
  userId?: string;
  fromBot?: boolean;
  isCustomerRead?: boolean;
}

export interface IConversationMessageDocument
  extends IConversationMessage,
    Document {
  _id: string;
}

export const attachmentPayloadSchema = new Schema(
  {
    id: field({ type: String, optional: true }),
    thumbnail: field({ type: String, optional: true }),
    url: field({ type: String, optional: true }),
    title: field({ type: String, optional: true }),
    description: field({ type: String, optional: true }),
    coordinates: new Schema(
      {
        latitude: field({ type: String, optional: true }),
        longitude: field({ type: String, optional: true })
      },
      { _id: false }
    )
  },
  { _id: false }
);

export const attachmentsSchema = new Schema(
  {
    id: field({ type: String, optional: true }),
    type: field({ type: String, optional: true }), // text, image, sticker, GIF, location, voice, link, links,
    thumbnail: field({ type: String, optional: true }),
    url: field({ type: String, optional: true }),
    name: field({ type: String }),
    description: field({ type: String, optional: true }),
    size: field({ type: Number, optional: true }),
    duration: field({ type: Number, optional: true }),
    coordinates: new Schema(
      {
        latitude: field({ type: String, optional: true }),
        longitude: field({ type: String, optional: true })
      },
      { _id: false }
    )
  },
  { _id: false }
);

export const conversationMessageSchema = new Schema({
  _id: field({ pkey: true }),
  mid: { type: String, unique: true, label: 'Zalo message id' },
  content: { type: String },
  // the following derives from inbox
  attachments: [attachmentsSchema],
  conversationId: field({ type: String, index: true }),
  customerId: field({ type: String, index: true }),
  visitorId: field({
    type: String,
    index: true,
    label: 'unique visitor id on logger database'
  }),
  fromBot: field({ type: Boolean }),
  userId: field({ type: String, index: true }),
  createdAt: field({ type: Date, index: true }),
  isCustomerRead: field({ type: Boolean })
});

export interface IConversationMessageModel
  extends Model<IConversationMessageDocument> {
  getMessage(_id: string): Promise<IConversationMessageDocument>;
  createMessage(
    doc: IConversationMessage
  ): Promise<IConversationMessageDocument>;
  addMessage(
    doc: IConversationMessage,
    userId?: string
  ): Promise<IConversationMessageDocument>;
}

export const loadConversationMessageClass = (models: IModels) => {
  class Message {
    /**
     * Retreives message
     */
    public static async getMessage(_id: string) {
      const message = await models.ConversationMessages.findOne({
        _id
      }).lean();

      if (!message) {
        throw new Error('Conversation message not found');
      }

      return message;
    }
    /**
     * Create a message
     */
    public static async createMessage(doc: IConversationMessage) {
      const message = await models.ConversationMessages.create({
        internal: false,
        ...doc,
        createdAt: doc.createdAt || new Date()
      });

      return message;
    }

    /**
     * Create a conversation message
     */
    public static async addMessage(doc: IConversationMessage, userId?: string) {
      const conversation = await models.Conversations.findOne({
        _id: doc.conversationId
      });

      if (!conversation) {
        throw new Error(`Conversation not found with id ${doc.conversationId}`);
      }

      // normalize content, attachments
      const content = doc.content || '';
      const attachments = doc.attachments || [];

      doc.content = content;
      doc.attachments = attachments;

      // <img> tags wrapped inside empty <p> tag should be allowed
      const contentValid =
        content.indexOf('<img') !== -1 ? true : strip(content);

      // if there is no attachments and no content then throw content required error
      if (attachments.length === 0 && !contentValid) {
        throw new Error('Content is required');
      }

      return this.createMessage({ ...doc, userId });
    }
  }

  conversationMessageSchema.loadClass(Message);

  return conversationMessageSchema;
};
