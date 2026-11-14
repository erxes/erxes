import { replaceMessageTemplateString } from '@/integrations/facebook/meta/automation/messages/utils';

export type TMessageTemplateContext = {
  prevAction?: Record<string, unknown>;
};

const replaceMessageTemplateValues = <T>(
  value: T,
  context: TMessageTemplateContext,
): T => {
  if (typeof value === 'string') {
    return replaceMessageTemplateString(value, context) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      replaceMessageTemplateValues(item, context),
    ) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        replaceMessageTemplateValues(item, context),
      ]),
    ) as T;
  }

  return value;
};

export const resolveInstagramActionConfigTemplates = <T>(
  config: T,
  context: TMessageTemplateContext = {},
): T => {
  if (!config) {
    return config;
  }

  return replaceMessageTemplateValues(config, context);
};
