import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { threadSchema } from '@/session/db/definitions/thread';
import { IMastraThreadDocument } from '@/session/@types/session';

// Derive a short, human-readable session title from the first user message.
function deriveTitle(message: string): string {
  const clean = (message || '').replace(/\s+/g, ' ').trim();
  if (!clean) return 'New chat';
  return clean.length > 60 ? clean.slice(0, 60) + '…' : clean;
}

export interface IMastraThreadModel extends Model<IMastraThreadDocument> {
  ensureThread(
    threadId: string,
    agentId: string,
    firstMessage?: string,
  ): Promise<IMastraThreadDocument>;
  touchThread(threadId: string): Promise<void>;
  getThreadsByAgent(agentId: string): Promise<IMastraThreadDocument[]>;
  renameThread(threadId: string, title: string): Promise<IMastraThreadDocument>;
  removeThread(threadId: string): Promise<{ ok?: number }>;
}

export const loadThreadClass = (_models: IModels) => {
  class MastraThread {
    // Find an existing session or create it on first use, titled from the
    // opening message.
    public static async ensureThread(
      threadId: string,
      agentId: string,
      firstMessage?: string,
    ) {
      const existing = await _models.MastraThread.findOne({ threadId });
      if (existing) return existing;
      return _models.MastraThread.create({
        threadId,
        agentId,
        title: deriveTitle(firstMessage || ''),
        lastMessageAt: new Date(),
      });
    }

    // Refresh activity timestamp + message count so the session list orders and
    // labels correctly.
    public static async touchThread(threadId: string) {
      const messageCount = await _models.MastraMessage.countDocuments({ threadId });
      await _models.MastraThread.updateOne(
        { threadId },
        { $set: { lastMessageAt: new Date(), messageCount } },
      );
    }

    public static async getThreadsByAgent(agentId: string) {
      return _models.MastraThread.find({ agentId }).sort({ lastMessageAt: -1 });
    }

    public static async renameThread(threadId: string, title: string) {
      const updated = await _models.MastraThread.findOneAndUpdate(
        { threadId },
        { $set: { title } },
        { new: true },
      );
      if (!updated) throw new Error('Thread not found');
      return updated;
    }

    public static async removeThread(threadId: string) {
      await _models.MastraMessage.deleteMany({ threadId });
      return _models.MastraThread.deleteOne({ threadId });
    }
  }

  threadSchema.loadClass(MastraThread);
  return threadSchema;
};
