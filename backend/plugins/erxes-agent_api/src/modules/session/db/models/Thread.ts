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
    userId: string,
    firstMessage?: string,
  ): Promise<IMastraThreadDocument>;
  touchThread(threadId: string): Promise<void>;
  getThreadsByOwner(
    agentId: string,
    userId: string,
  ): Promise<IMastraThreadDocument[]>;
  getOwnedThread(
    threadId: string,
    userId: string,
  ): Promise<IMastraThreadDocument>;
  renameThread(
    threadId: string,
    title: string,
    userId: string,
  ): Promise<IMastraThreadDocument>;
  setGeneratedTitle(
    threadId: string,
    title: string,
    messageCount: number,
  ): Promise<boolean>;
  removeThread(threadId: string, userId: string): Promise<{ ok?: number }>;
}

export const loadThreadClass = (_models: IModels) => {
  class MastraThread {
    // Find an existing session or create it on first use, titled from the
    // opening message. Ownership boundary: a thread owned by someone else is
    // reported as "not found" (existence is not leaked). Legacy threads with
    // no owner are claimed by the caller — backfill-by-use.
    public static async ensureThread(
      threadId: string,
      agentId: string,
      userId: string,
      firstMessage?: string,
    ) {
      const existing = await _models.MastraThread.findOne({ threadId });
      if (existing) {
        if (!existing.userId) {
          existing.userId = userId;
          await existing.save();
          return existing;
        }
        if (existing.userId !== userId) throw new Error('Thread not found');
        return existing;
      }
      return _models.MastraThread.create({
        threadId,
        agentId,
        userId,
        title: deriveTitle(firstMessage || ''),
        lastMessageAt: new Date(),
      });
    }

    // Refresh activity timestamp + message count so the session list orders and
    // labels correctly.
    public static async touchThread(threadId: string) {
      const messageCount = await _models.MastraMessage.countDocuments({
        threadId,
      });
      await _models.MastraThread.updateOne(
        { threadId },
        { $set: { lastMessageAt: new Date(), messageCount } },
      );
    }

    // Only the caller's own sessions — never other users' or bot threads.
    public static async getThreadsByOwner(agentId: string, userId: string) {
      return _models.MastraThread.find({ agentId, userId }).sort({
        lastMessageAt: -1,
      });
    }

    // Fetch a thread the caller owns; "not found" otherwise (no existence leak).
    public static async getOwnedThread(threadId: string, userId: string) {
      const thread = await _models.MastraThread.findOne({ threadId, userId });
      if (!thread) throw new Error('Thread not found');
      return thread;
    }

    // A manual rename is final — the auto-titler never overwrites it.
    public static async renameThread(
      threadId: string,
      title: string,
      userId: string,
    ) {
      const updated = await _models.MastraThread.findOneAndUpdate(
        { threadId, userId },
        { $set: { title, titleSource: 'manual' } },
        { new: true },
      );
      if (!updated) throw new Error('Thread not found');
      return updated;
    }

    // Apply an LLM-generated title. The filter guards against racing a manual
    // rename: once titleSource is 'manual', this is a no-op. Returns whether
    // the title was applied.
    public static async setGeneratedTitle(
      threadId: string,
      title: string,
      messageCount: number,
    ) {
      const updated = await _models.MastraThread.findOneAndUpdate(
        { threadId, titleSource: { $ne: 'manual' } },
        {
          $set: {
            title,
            titleSource: 'generated',
            titleMessageCount: messageCount,
          },
        },
        { new: true },
      );
      return !!updated;
    }

    public static async removeThread(threadId: string, userId: string) {
      // Verify ownership before touching messages.
      await MastraThread.getOwnedThread(threadId, userId);
      await _models.MastraMessage.deleteMany({ threadId });
      return _models.MastraThread.deleteOne({ threadId, userId });
    }
  }

  threadSchema.loadClass(MastraThread);
  return threadSchema;
};
