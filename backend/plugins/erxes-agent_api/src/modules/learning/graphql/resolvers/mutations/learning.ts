import { IContext } from '~/connectionResolvers';
import {
  MastraLearningStatus,
  MastraLearningType,
} from '@/learning/@types/learning';
import {
  learningTenant,
  resolveLearningTuning,
} from '~/mastra/learning/config';
import {
  syncLearningVectorSafe,
  setLearningVectorStatusSafe,
  deleteLearningVectorSafe,
} from '~/mastra/learning/store';

/** Throws unless a logged-in user is on the context; returns their _id. */
function requireUserId(user: { _id?: string } | null | undefined): string {
  if (!user?._id) throw new Error('Login required');
  return user._id;
}

// Shape of the MastraLearningInput GraphQL input.
export interface IMastraLearningInput {
  statement: string;
  type: MastraLearningType;
  contextTags?: string[];
  agentId?: string;
}

const STATUSES: MastraLearningStatus[] = [
  'candidate',
  'approved',
  'rejected',
  'conflict',
  'archived',
];

export const learningMutations = {
  // Manual entry from the curation UI — trusted, so it lands approved.
  mastraLearningAdd: async (
    _: unknown,
    { doc }: { doc: IMastraLearningInput },
    { models, user, subdomain }: IContext,
  ) => {
    const userId = requireUserId(user);
    const learning = await models.MastraLearning.createLearning({
      ...doc,
      status: 'approved',
      confidence: 0.9,
      createdBy: userId,
      reviewedByUserId: userId,
    });
    await syncLearningVectorSafe(learningTenant(subdomain), learning);
    return learning;
  },

  mastraLearningEdit: async (
    _: unknown,
    { _id, doc }: { _id: string; doc: IMastraLearningInput },
    { models, user, subdomain }: IContext,
  ) => {
    requireUserId(user);
    const learning = await models.MastraLearning.updateLearning(_id, doc);
    // Statement may have changed — re-embed.
    await syncLearningVectorSafe(learningTenant(subdomain), learning);
    return learning;
  },

  mastraLearningSetStatus: async (
    _: unknown,
    { _id, status }: { _id: string; status: string },
    { models, user, subdomain }: IContext,
  ) => {
    const userId = requireUserId(user);
    const next = STATUSES.find((s) => s === status);
    if (!next) throw new Error(`Invalid status "${status}"`);
    const learning = await models.MastraLearning.setStatus(_id, next, userId);
    await setLearningVectorStatusSafe(learningTenant(subdomain), _id, next);
    return learning;
  },

  mastraLearningPin: async (
    _: unknown,
    { _id, pinned }: { _id: string; pinned: boolean },
    { models, user }: IContext,
  ) => {
    requireUserId(user);
    return models.MastraLearning.setPinned(_id, pinned);
  },

  mastraLearningRemove: async (
    _: unknown,
    { _id }: { _id: string },
    { models, user, subdomain }: IContext,
  ) => {
    requireUserId(user);
    await models.MastraLearning.deleteOne({ _id });
    await deleteLearningVectorSafe(learningTenant(subdomain), _id);
    return { ok: true };
  },

  // Thumbs up/down on one assistant message. The rating reinforces (or
  // penalizes) whichever learnings were injected into that turn's context.
  mastraMessageFeedback: async (
    _: unknown,
    args: { messageId: string; rating: number; comment?: string },
    { models, user }: IContext,
  ) => {
    const userId = requireUserId(user);
    if (args.rating !== 1 && args.rating !== -1) {
      throw new Error('rating must be 1 or -1');
    }

    const message = await models.MastraMessage.findOne({ _id: args.messageId });
    if (!message || message.role !== 'assistant') {
      throw new Error('Message not found');
    }
    // Ownership gate — you can only rate replies in your own threads.
    await models.MastraThread.getOwnedThread(message.threadId, userId);

    const learningIds: string[] = message.meta?.learningIdsInContext ?? [];

    const { previousRating } = await models.MastraFeedback.saveFeedback({
      threadId: message.threadId,
      messageId: args.messageId,
      userId,
      rating: args.rating as 1 | -1,
      comment: args.comment,
      learningIdsInContext: learningIds,
    });

    // Net reinforcement: undo the previous vote's delta when re-voting.
    if (learningIds.length) {
      const tuning = resolveLearningTuning();
      const deltaFor = (r: number) =>
        r > 0 ? tuning.feedbackUpDelta : tuning.feedbackDownDelta;
      const net =
        deltaFor(args.rating) - (previousRating ? deltaFor(previousRating) : 0);
      await models.MastraLearning.reinforce(learningIds, net);
    }

    return { ok: true, rating: args.rating };
  },
};
