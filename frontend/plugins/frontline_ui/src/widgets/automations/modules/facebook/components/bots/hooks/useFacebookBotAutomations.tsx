import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { useMemo } from 'react';
import { FACEBOOK_MESSAGE_TRIGGER_TYPE } from '~/widgets/automations/modules/facebook/components/bots/constants';
import { FACEBOOK_BOT_AUTOMATIONS } from '~/widgets/automations/modules/facebook/components/bots/graphql/botAutomationsQueries';

export type TBotMessageTriggerConfig = {
  botId?: string;
  // Comment triggers narrow by post instead of by condition.
  postType?: 'any' | 'specific';
  postId?: string;
  conditions?: Array<{
    _id: string;
    type:
      | 'getStarted'
      | 'persistentMenu'
      | 'iceBreaker'
      | 'direct'
      | 'open_thread';
    isSelected?: boolean;
    persistentMenuIds?: string[];
    iceBreakerIds?: string[];
    // Keyword rules of a direct-message condition.
    conditions?: Array<{
      keywords?: Array<{ text?: string }>;
    }>;
  }>;
};

export type TBotAutomationTrigger = {
  id: string;
  type: string;
  config: TBotMessageTriggerConfig;
};

const isBotTriggerConfig = (
  config: unknown,
): config is TBotMessageTriggerConfig =>
  typeof config === 'object' && config !== null && !Array.isArray(config);

export type TBotAutomation = {
  _id: string;
  name: string;
  status?: string;
  triggers: TBotAutomationTrigger[];
};

/**
 * Automations listening to this bot. The link lives in the trigger config, so
 * the list query is filtered by trigger type and narrowed here.
 */
export const useFacebookBotAutomations = (
  botId?: string,
  triggerType: string | string[] = FACEBOOK_MESSAGE_TRIGGER_TYPE,
) => {
  const triggerTypes = useMemo(
    () => (Array.isArray(triggerType) ? triggerType : [triggerType]),
    [triggerType],
  );
  const { data, loading } = useQuery(FACEBOOK_BOT_AUTOMATIONS, {
    variables: { triggerTypes },
    skip: !botId,
  });

  const automations = useMemo<TBotAutomation[]>(() => {
    if (!botId) {
      return [];
    }

    return (data?.automations ?? [])
      .filter(isDefined)
      .reduce<TBotAutomation[]>((matched, automation) => {
        const triggers = (automation.triggers ?? []).flatMap((trigger) => {
          const config = trigger?.config;

          if (
            !trigger?.id ||
            !trigger.type ||
            !triggerTypes.includes(trigger.type) ||
            !isBotTriggerConfig(config) ||
            config.botId !== botId
          ) {
            return [];
          }

          return [{ id: trigger.id, type: trigger.type, config }];
        });

        if (!triggers.length) {
          return matched;
        }

        return [
          ...matched,
          {
            _id: automation._id,
            name: automation.name || automation._id,
            status: automation.status ?? undefined,
            triggers,
          },
        ];
      }, []);
  }, [botId, data, triggerTypes]);

  return { automations, loading };
};
