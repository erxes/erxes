import { useMemo } from 'react';
import { FACEBOOK_COMMENT_TRIGGER_TYPE } from '~/widgets/automations/modules/facebook/components/bots/constants';
import { useFacebookBotAutomations } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotAutomations';
import { TTriggerClaim } from './useFacebookBotTriggerClaims';

export type TCommentTriggerClaims = {
  /** Automations answering every post on this bot. */
  anyPost: TTriggerClaim[];
  /** Automations answering one post, keyed by its id. */
  byPost: Record<string, TTriggerClaim[]>;
};

/**
 * Comment automations on the same bot that would answer the same comment. Two
 * of them mean two public replies under one post, which is the repetition
 * Meta's Spam policy restricts.
 */
export const useFacebookCommentTriggerClaims = (
  botId?: string,
  currentTriggerId?: string,
) => {
  const { automations, loading } = useFacebookBotAutomations(
    botId,
    FACEBOOK_COMMENT_TRIGGER_TYPE,
  );

  const claims = useMemo<TCommentTriggerClaims>(() => {
    const collected: TCommentTriggerClaims = { anyPost: [], byPost: {} };

    for (const automation of automations) {
      const claim: TTriggerClaim = {
        _id: automation._id,
        name: automation.name,
        isActive: automation.status === 'active',
      };

      for (const { id, config } of automation.triggers) {
        if (id === currentTriggerId) {
          continue;
        }

        if (config.postType === 'specific' && config.postId) {
          const bucket = (collected.byPost[config.postId] ||= []);

          if (!bucket.some(({ _id }) => _id === claim._id)) {
            bucket.push(claim);
          }

          continue;
        }

        if (!collected.anyPost.some(({ _id }) => _id === claim._id)) {
          collected.anyPost.push(claim);
        }
      }
    }

    return collected;
  }, [automations, currentTriggerId]);

  return { claims, loading };
};
