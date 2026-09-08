import { useMemo } from 'react';
import {
  TBotAutomation,
  useFacebookBotAutomations,
} from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotAutomations';

export type TTriggerClaim = {
  _id: string;
  name: string;
  isActive: boolean;
};

export type TFacebookBotTriggerClaims = {
  getStarted: TTriggerClaim[];
  persistentMenuIds: Record<string, TTriggerClaim[]>;
  iceBreakerIds: Record<string, TTriggerClaim[]>;
  directKeywords: Record<string, TTriggerClaim[]>;
  directCatchAll: TTriggerClaim[];
};

export const normalizeKeyword = (keyword: string) =>
  keyword.trim().toLowerCase();

const emptyClaims = (): TFacebookBotTriggerClaims => ({
  getStarted: [],
  persistentMenuIds: {},
  iceBreakerIds: {},
  directKeywords: {},
  directCatchAll: [],
});

const push = (bucket: TTriggerClaim[], claim: TTriggerClaim) => {
  if (!bucket.some(({ _id }) => _id === claim._id)) {
    bucket.push(claim);
  }
};

const pushKeyed = (
  map: Record<string, TTriggerClaim[]>,
  key: string,
  claim: TTriggerClaim,
) => {
  map[key] = map[key] || [];
  push(map[key], claim);
};

/**
 * What other automations already listen for on this bot. Only active ones can
 * actually double-fire — `receiveTrigger` filters on `status: 'active'` — so a
 * draft claim is reported but never blocks.
 */
export const useFacebookBotTriggerClaims = (
  botId?: string,
  currentTriggerId?: string,
) => {
  const { automations, loading } = useFacebookBotAutomations(botId);

  const claims = useMemo(() => {
    const collected = emptyClaims();

    for (const automation of automations as TBotAutomation[]) {
      const claim: TTriggerClaim = {
        _id: automation._id,
        name: automation.name,
        isActive: automation.status === 'active',
      };

      for (const { id, config } of automation.triggers) {
        // The trigger being edited is not a competitor with itself.
        if (id === currentTriggerId) {
          continue;
        }

        for (const condition of config.conditions || []) {
          if (!condition.isSelected) {
            continue;
          }

          if (condition.type === 'getStarted') {
            push(collected.getStarted, claim);
          }

          for (const menuId of condition.type === 'persistentMenu'
            ? condition.persistentMenuIds || []
            : []) {
            pushKeyed(collected.persistentMenuIds, menuId, claim);
          }

          for (const iceBreakerId of condition.type === 'iceBreaker'
            ? condition.iceBreakerIds || []
            : []) {
            pushKeyed(collected.iceBreakerIds, iceBreakerId, claim);
          }

          if (condition.type === 'direct') {
            const keywords = (condition.conditions || []).flatMap(
              (rule) => rule.keywords || [],
            );

            if (!keywords.length) {
              push(collected.directCatchAll, claim);
              continue;
            }

            for (const { text } of keywords) {
              const normalized = normalizeKeyword(text || '');

              if (normalized) {
                pushKeyed(collected.directKeywords, normalized, claim);
              }
            }
          }
        }
      }
    }

    return collected;
  }, [automations, currentTriggerId]);

  return { claims, loading };
};
