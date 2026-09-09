import { TBotMessageTriggerConfig } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotAutomations';

type TKeywordRule = NonNullable<
  NonNullable<TBotMessageTriggerConfig['conditions']>[number]['conditions']
>[number] & { operator?: string };

/**
 * Mirrors `checkContentConditions` in frontline_api, including its quirks: only
 * the first rule is ever evaluated, and `every` compares each keyword to the
 * whole message. Both must change together.
 */
export const matchesKeywordRules = (
  content: string,
  rules: TKeywordRule[] = [],
) => {
  for (const rule of rules) {
    const keywords = (rule?.keywords || [])
      .map(({ text }) => text)
      .filter((text): text is string => Boolean(text));

    switch (rule?.operator || '') {
      case 'every':
        return keywords.every((keyword) => content === keyword);
      case 'some':
      case 'isEqual':
        return keywords.some((keyword) => content === keyword);
      case 'isContains':
        return keywords.some((keyword) => {
          try {
            return Boolean(content.match(new RegExp(keyword, 'i')));
          } catch {
            // A keyword that is not valid regex throws on the server too.
            return false;
          }
        });
      case 'startWith':
        return keywords.some((keyword) => content.startsWith(keyword));
      case 'endWith':
        return keywords.some((keyword) => content.endsWith(keyword));
      default:
        return false;
    }
  }

  return false;
};

/**
 * Whether a typed message would start this trigger, following the same order as
 * `checkMessageTrigger`: a selected direct condition decides on the spot.
 */
export const triggerMatchesDirectMessage = (
  content: string,
  config: TBotMessageTriggerConfig,
) => {
  for (const condition of config.conditions || []) {
    if (!condition.isSelected || condition.type !== 'direct') {
      continue;
    }

    const rules = condition.conditions || [];

    if (rules.length) {
      return matchesKeywordRules(content, rules);
    }

    return Boolean(content.trim());
  }

  return false;
};
