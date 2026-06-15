import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { messageSchema } from '@/session/db/definitions/message';
import {
  IMastraChatAttachment,
  IMastraMessageDocument,
  IMastraMessageMeta,
  MastraMessageRole,
} from '@/session/@types/session';

export interface IMastraMessageModel extends Model<IMastraMessageDocument> {
  addMessage(
    threadId: string,
    role: MastraMessageRole,
    content: string,
    meta?: IMastraMessageMeta,
    attachments?: IMastraChatAttachment[],
  ): Promise<IMastraMessageDocument>;
  getMessages(threadId: string): Promise<IMastraMessageDocument[]>;
  // Last N messages in chronological order — used to build the LLM context window.
  getRecent(threadId: string, limit: number): Promise<IMastraMessageDocument[]>;
}

export const loadMessageClass = (_models: IModels) => {
  class MastraMessage {
    public static async addMessage(
      threadId: string,
      role: MastraMessageRole,
      content: string,
      meta?: IMastraMessageMeta,
      attachments?: IMastraChatAttachment[],
    ) {
      return _models.MastraMessage.create({
        threadId,
        role,
        content,
        meta,
        attachments: attachments?.length ? attachments : undefined,
      });
    }

    public static async getMessages(threadId: string) {
      return _models.MastraMessage.find({ threadId }).sort({ createdAt: 1 });
    }

    public static async getRecent(threadId: string, limit: number) {
      const docs = await _models.MastraMessage.find({ threadId })
        .sort({ createdAt: -1 })
        .limit(limit);
      return docs.reverse();
    }
  }

  messageSchema.loadClass(MastraMessage);
  return messageSchema;
};
