import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { FACEBOOK_MESSAGE_TRIGGER_TYPE } from '~/widgets/automations/modules/facebook/components/bots/constants';
import { FACEBOOK_BOT_AUTOMATIONS } from '~/widgets/automations/modules/facebook/components/bots/graphql/botAutomationsQueries';

export type TBotMessageTriggerConfig = {
  botId?: string;
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

type TAutomationRecord = {
  _id: string;
  name?: string;
  status?: string;
  triggers?: Array<{
    id: string;
    type: string;
    config?: TBotMessageTriggerConfig;
  }>;
};

export type TBotAutomationTrigger = {
  id: string;
  config: TBotMessageTriggerConfig;
};

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
export const useFacebookBotAutomations = (botId?: string) => {
  const { data, loading } = useQuery<{ automations: TAutomationRecord[] }>(
    FACEBOOK_BOT_AUTOMATIONS,
    {
      variables: { triggerTypes: [FACEBOOK_MESSAGE_TRIGGER_TYPE] },
      skip: !botId,
    },
  );

  const automations = useMemo<TBotAutomation[]>(() => {
    if (!botId) {
      return [];
    }

    return (data?.automations || []).reduce<TBotAutomation[]>(
      (matched, automation) => {
        const triggers = (automation.triggers || [])
          .filter(
            (trigger) =>
              trigger.type === FACEBOOK_MESSAGE_TRIGGER_TYPE &&
              trigger.config?.botId === botId,
          )
          .map(({ id, config }) => ({
            id,
            config: config as TBotMessageTriggerConfig,
          }));

        if (!triggers.length) {
          return matched;
        }

        return [
          ...matched,
          {
            _id: automation._id,
            name: automation.name || automation._id,
            status: automation.status,
            triggers,
          },
        ];
      },
      [],
    );
  }, [botId, data]);

  return { automations, loading };
};
