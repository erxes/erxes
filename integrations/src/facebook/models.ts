import { Document, Model, model, Schema } from 'mongoose';
import { field } from '../models/utils';

// customer ======================
export interface ICustomer {
  userId: string;
  // id on erxes-api
  erxesApiId?: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  integrationId: string;
}

export interface ICustomerDocument extends ICustomer, Document {}

export const customerSchema = new Schema({
  _id: field({ pkey: true }),
  userId: { type: String, unique: true },
  erxesApiId: String,
  firstName: String,
  lastName: String,
  profilePic: String,
  integrationId: String,
});

export interface ICustomerModel extends Model<ICustomerDocument> {
  getCustomer(selector: any, isLean?: boolean): Promise<ICustomerDocument>;
}

export const loadCustomerClass = () => {
  class Customer {
    public static async getCustomer(selector: any, isLean: boolean) {
      let customer = await Customers.findOne(selector);

      if (isLean) {
        customer = await Customers.findOne(selector).lean();
      }

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer;
    }
  }

  customerSchema.loadClass(Customer);

  return customerSchema;
};

// conversation ===========================
export interface IConversation {
  // id on erxes-api
  erxesApiId?: string;
  timestamp: Date;
  senderId: string;
  recipientId: string;
  content: string;
  integrationId: string;
}

export interface IConversationDocument extends IConversation, Document {}

export const conversationSchema = new Schema({
  _id: field({ pkey: true }),
  erxesApiId: String,
  timestamp: Date,
  senderId: { type: String, index: true },
  recipientId: { type: String, index: true },
  integrationId: String,
  content: String,
});

conversationSchema.index({ senderId: 1, recipientId: 1 }, { unique: true });

export interface IConversationModel extends Model<IConversationDocument> {
  getConversation(selector): Promise<IConversationDocument>;
}

export const loadConversationClass = () => {
  class Conversation {
    public static async getConversation(selector) {
      const conversation = await Conversations.findOne(selector);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      return conversation;
    }
  }

  conversationSchema.loadClass(Conversation);

  return conversationSchema;
};

// conversation message ===========================
export interface IConversationMessage {
  mid: string;
  conversationId: string;
  content: string;
}

export interface IConversationMessageDocument extends IConversationMessage, Document {}

export const conversationMessageSchema = new Schema({
  _id: field({ pkey: true }),
  mid: { type: String, unique: true },
  conversationId: String,
  content: String,
});

export interface IConversationMessageModel extends Model<IConversationMessageDocument> {}

export interface IPost {
  postId: string;
  recipientId: string;
  senderId: string;
  content: string;
  erxesApiId?: string;
  attachments: string[];
  timestamp: Date;
  permalink_url: string;
}

export interface IPostDocument extends IPost, Document {}

export const postSchema = new Schema({
  _id: field({ pkey: true }),
  postId: { type: String, index: true },
  recipientId: { type: String, index: true },
  senderId: String,
  content: String,
  attachments: [String],
  erxesApiId: String,
  permalink_url: String,
  timestamp: Date,
});

postSchema.index({ recipientId: 1, postId: 1 }, { unique: true });

export interface IPostModel extends Model<IPostDocument> {
  getPost(selector: any, isLean?: boolean): Promise<IPostDocument>;
}

export const loadPostClass = () => {
  class Post {
    public static async getPost(selector: any, isLean: boolean) {
      let post = await Posts.findOne(selector);

      if (isLean) {
        post = await Posts.findOne(selector).lean();
      }

      if (!post) {
        throw new Error('Post not found');
      }

      return post;
    }
  }

  postSchema.loadClass(Post);

  return postSchema;
};

export interface IComment {
  commentId: string;
  isResolved: boolean;
  postId: string;
  recipientId: string;
  parentId: string;
  senderId: string;
  attachments: string[];
  content: string;
  erxesApiId: string;
  timestamp: Date;
  permalink_url: string;
}

export interface ICommentDocument extends IComment, Document {}

export const commentSchema = new Schema({
  _id: field({ pkey: true }),
  commentId: { type: String, index: true },
  postId: { type: String, index: true },
  recipientId: String,
  senderId: String,
  parentId: String,
  permalink_url: String,
  attachments: [String],
  content: String,
  erxesApiId: String,
  timestamp: Date,
  isResolved: { type: Boolean, default: false },
});

commentSchema.index({ postId: 1, commentId: 1 }, { unique: true });

export interface ICommentModel extends Model<ICommentDocument> {
  getComment(selector): Promise<ICommentDocument>;
}

export const loadCommentClass = () => {
  class Comment {
    public static async getComment(selector) {
      const comment = await Comments.findOne(selector);

      if (!comment) {
        throw new Error('Comment not found');
      }

      return comment;
    }
  }

  commentSchema.loadClass(Comment);

  return commentSchema;
};

loadCustomerClass();

loadCommentClass();

loadConversationClass();

loadPostClass();
// tslint:disable-next-line
export const Customers = model<ICustomerDocument, ICustomerModel>('customers_facebook', customerSchema);

// tslint:disable-next-line
export const Conversations = model<IConversationDocument, IConversationModel>(
  'conversations_facebook',
  conversationSchema,
);

// tslint:disable-next-line
export const ConversationMessages = model<IConversationMessageDocument, IConversationMessageModel>(
  'conversation_messages_facebook',
  conversationMessageSchema,
);

// tslint:disable-next-line
export const Posts = model<IPostDocument, IPostModel>('posts_facebook', postSchema);

// tslint:disable-next-line
export const Comments = model<ICommentDocument, ICommentModel>('comments_facebook', commentSchema);
