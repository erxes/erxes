import { TBotAutomation } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotAutomations';
import { triggerMatchesDirectMessage } from '~/widgets/automations/modules/facebook/components/bots/utils/matchDirectMessage';
import {
  TMessengerIceBreakerPreviewItem,
  TMessengerMenuPreviewItem,
} from '~/widgets/automations/modules/facebook/components/bots/utils/buildMessengerProfilePreview';

export type TBotMenuOutcome =
  | { kind: 'opensLink'; url?: string }
  | { kind: 'handsOffToHuman' }
  | { kind: 'resumesWait' }
  | { kind: 'startsAutomations'; automations: TBotAutomation[] }
  | { kind: 'noListener' };

const startsOnGetStarted = ({ triggers }: TBotAutomation) =>
  triggers.some(({ config }) =>
    (config.conditions || []).some(
      (condition) => condition.isSelected && condition.type === 'getStarted',
    ),
  );

const startsOnIceBreaker = ({ triggers }: TBotAutomation, iceBreakerId: string) =>
  triggers.some(({ config }) =>
    (config.conditions || []).some(
      (condition) =>
        condition.isSelected &&
        condition.type === 'iceBreaker' &&
        (condition.iceBreakerIds || []).includes(iceBreakerId),
    ),
  );

const startsOnMenuItem = ({ triggers }: TBotAutomation, sourceId: string) =>
  triggers.some(({ config }) =>
    (config.conditions || []).some(
      (condition) =>
        condition.isSelected &&
        condition.type === 'persistentMenu' &&
        (condition.persistentMenuIds || []).includes(sourceId),
    ),
  );

/**
 * What tapping a menu action actually does, following the same order as
 * `receiveFacebookMessageTrigger`: a web_url never reaches erxes, a back action
 * resumes a paused execution, and everything else is matched by payload.
 */
export const resolveBotMenuOutcome = (
  item: TMessengerMenuPreviewItem,
  automations: TBotAutomation[],
): TBotMenuOutcome => {
  if (item.kind === 'webUrl') {
    return { kind: 'opensLink', url: item.url };
  }

  // `receiveFacebookMessage` hands these off and returns before the trigger.
  if (item.sourceType === 'human_handoff') {
    return { kind: 'handsOffToHuman' };
  }

  if (item.sourceType === 'back_button') {
    return { kind: 'resumesWait' };
  }

  const matched =
    item.kind === 'getStarted'
      ? automations.filter(startsOnGetStarted)
      : automations.filter(
          (automation) =>
            !!item.sourceId && startsOnMenuItem(automation, item.sourceId),
        );

  return matched.length
    ? { kind: 'startsAutomations', automations: matched }
    : { kind: 'noListener' };
};

/** Which automations a typed message would start. */
export const resolveDirectMessageOutcome = (
  content: string,
  automations: TBotAutomation[],
): TBotMenuOutcome => {
  const matched = automations.filter(({ triggers }) =>
    triggers.some(({ config }) => triggerMatchesDirectMessage(content, config)),
  );

  return matched.length
    ? { kind: 'startsAutomations', automations: matched }
    : { kind: 'noListener' };
};

/** An ice breaker is always a postback, so only the payload decides. */
export const resolveIceBreakerOutcome = (
  item: TMessengerIceBreakerPreviewItem,
  automations: TBotAutomation[],
): TBotMenuOutcome => {
  const matched = automations.filter((automation) =>
    startsOnIceBreaker(automation, item.key),
  );

  return matched.length
    ? { kind: 'startsAutomations', automations: matched }
    : { kind: 'noListener' };
};
