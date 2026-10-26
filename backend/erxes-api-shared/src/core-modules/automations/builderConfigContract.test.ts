import { readFileSync } from 'fs';
import { join } from 'path';
import { aiAgentActionConfigSchema } from './aiAgentActionConfigSchema';
import {
  TAutomationConfigSchema,
  toAutomationConfigIssues,
} from './configSchema';
import {
  delayActionConfigSchema,
  findObjectActionConfigSchema,
  ifActionConfigSchema,
  messageProActionConfigSchema,
  outgoingWebhookActionConfigSchema,
  sendEmailActionConfigSchema,
  setPropertyActionConfigSchema,
  splitActionConfigSchema,
  transformActionConfigSchema,
} from './coreActionConfigSchemas';

/**
 * Configs the builder wrote, taken from saved automations. A schema may find
 * one incomplete, never malformed: that would refuse what the builder saves.
 * When the builder changes how it writes a field, add its config here.
 */
const schemas: Record<string, TAutomationConfigSchema> = {
  if: ifActionConfigSchema,
  split: splitActionConfigSchema,
  findObject: findObjectActionConfigSchema,
  transform: transformActionConfigSchema,
  setProperty: setPropertyActionConfigSchema,
  sendEmail: sendEmailActionConfigSchema,
  outgoingWebhook: outgoingWebhookActionConfigSchema,
  messagePro: messageProActionConfigSchema,
  aiAgent: aiAgentActionConfigSchema,
  delay: delayActionConfigSchema,
};

const malformedOf = (schema: TAutomationConfigSchema, config: unknown) => {
  const parsed = schema.safeParse(config);

  return parsed.success
    ? []
    : toAutomationConfigIssues(parsed.error, config).filter(
        ({ malformed }) => malformed,
      );
};

const builderConfigs: Record<string, unknown[]> = JSON.parse(
  readFileSync(
    join(__dirname, '__fixtures__/builderActionConfigs.json'),
    'utf8',
  ),
);

describe('configs the builder writes', () => {
  it.each(Object.entries(builderConfigs))(
    '%s is never malformed',
    (type, configs) => {
      for (const config of configs) {
        expect(malformedOf(schemas[type], config)).toEqual([]);
      }
    },
  );
});
