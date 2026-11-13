import { useMemo } from 'react';
import { useFacebookBotAutomations } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotAutomations';
import { TTriggerClaim } from '~/widgets/automations/modules/facebook/components/trigger/hooks/useFacebookBotTriggerClaims';
import {
  INSTAGRAM_COMMENT_TRIGGER_TYPE,
  INSTAGRAM_MESSAGE_TRIGGER_TYPE,
} from '~/widgets/automations/modules/instagram/components/bots/constants';
import { TInstagramAiReplyChannel } from '~/widgets/automations/modules/instagram/components/bots/utils/buildAiReplySeedLink';

const pushClaim = (bucket: TTriggerClaim[], claim: TTriggerClaim) => {
  if (!bucket.some(({ _id }) => _id === claim._id)) {
    bucket.push(claim);
  }
};

export const useInstagramBotAiReplyClaims = (
  botId: string | undefined,
  channel: TInstagramAiReplyChannel | null,
) => {
  const triggerType =
    channel === 'comment'
      ? INSTAGRAM_COMMENT_TRIGGER_TYPE
      : INSTAGRAM_MESSAGE_TRIGGER_TYPE;
  const { automations, loading } = useFacebookBotAutomations(
    channel ? botId : undefined,
    triggerType,
  );

  const claims = useMemo(() => {
    const collected: TTriggerClaim[] = [];

    for (const automation of automations) {
      const claim: TTriggerClaim = {
        _id: automation._id,
        name: automation.name,
        isActive: automation.status === 'active',
      };

      for (const { config } of automation.triggers) {
        if (channel === 'comment') {
          if (config.postType !== 'specific' || !config.postId) {
            pushClaim(collected, claim);
          }

          continue;
        }

        const answersAnyText = (config.conditions || []).some(
          (condition) =>
            condition.isSelected &&
            condition.type === 'direct' &&
            !(condition.conditions || []).some(
              (rule) => (rule.keywords || []).length,
            ),
        );

        if (answersAnyText) {
          pushClaim(collected, claim);
        }
      }
    }

    return collected;
  }, [automations, channel]);

  return { claims, loading };
};
