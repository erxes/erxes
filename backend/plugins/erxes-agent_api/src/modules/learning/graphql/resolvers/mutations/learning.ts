import { ExpectedError } from 'erxes-api-shared/utils';
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
import { findOwnedAssistantMessage } from '@/session/nativeStore';
import { pushUserScore } from '~/mastra/scoring/langfuseClient';

/** Throws unless a logged-in user is on the context; returns their _id. */
function requireUserId(user: { _id?: string } | null | undefined): string {
  if (!user?._id) throw new ExpectedError('Login required');
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
    { models, user, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('learningCreate');
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
    { models, user, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('learningEdit');
    requireUserId(user);
    const learning = await models.MastraLearning.updateLearning(_id, doc);
    // Statement may have changed — re-embed.
    await syncLearningVectorSafe(learningTenant(subdomain), learning);
    return learning;
  },

  mastraLearningSetStatus: async (
    _: unknown,
    { _id, status }: { _id: string; status: string },
    { models, user, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('learningEdit');
    const userId = requireUserId(user);
    const next = STATUSES.find((s) => s === status);
    if (!next) throw new ExpectedError(`Invalid status "${status}"`);
    const learning = await models.MastraLearning.setStatus(_id, next, userId);
    await setLearningVectorStatusSafe(learningTenant(subdomain), _id, next);
    return learning;
  },

  mastraLearningPin: async (
    _: unknown,
    { _id, pinned }: { _id: string; pinned: boolean },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('learningEdit');
    requireUserId(user);
    return models.MastraLearning.setPinned(_id, pinned);
  },

  mastraLearningRemove: async (
    _: unknown,
    { _id }: { _id: string },
    { models, user, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('learningRemove');
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
    { models, user, subdomain, checkPermission }: IContext,
  ) => {
    // Rating a chat message is part of using the agent, not learning curation.
    await checkPermission('agentsChat');
    const userId = requireUserId(user);
    if (args.rating !== 1 && args.rating !== -1) {
      throw new ExpectedError('rating must be 1 or -1');
    }

    // Resolve the assistant message from the native store by its id: verifies
    // it is the caller's own assistant reply (resource-scope ownership) and
    // returns the learnings that were in that turn's context.
    const {
      threadId,
      learningIdsInContext: learningIds,
      langfuseTraceId,
    } = await findOwnedAssistantMessage(subdomain, userId, args.messageId);

    const { previousRating } = await models.MastraFeedback.saveFeedback({
      threadId,
      messageId: args.messageId,
      userId,
      rating: args.rating as 1 | -1,
      comment: args.comment,
      learningIdsInContext: learningIds,
    });

    // Plan B: mirror the human thumbs into Langfuse as a score on this turn's
    // trace (the SDK, never the CLI). Only AFTER the feedback is persisted, so a
    // failed save never emits a phantom score. Fire-and-forget + self-guarding:
    // no trace id or no Langfuse configured → no-op, feedback still succeeds.
    void pushUserScore({
      traceId: langfuseTraceId,
      name: 'user-feedback',
      value: args.rating,
      comment: args.comment,
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
