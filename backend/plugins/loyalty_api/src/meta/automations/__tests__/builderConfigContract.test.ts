import {
  TAutomationConfigSchema,
  toAutomationConfigIssues,
} from 'erxes-api-shared/core-modules';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  adjustScoreActionConfigSchema,
  issueVoucherActionConfigSchema,
  setTierActionConfigSchema,
} from '../configSchemas';

/**
 * Configs the builder wrote, taken from saved automations. A schema may find
 * one incomplete, never malformed: that would refuse what the builder saves.
 */
const schemas: Record<string, TAutomationConfigSchema> = {
  'loyalty:voucher.voucher.create': issueVoucherActionConfigSchema,
  'loyalty:score.tier.create': setTierActionConfigSchema,
  'loyalty:score.score.create': adjustScoreActionConfigSchema,
};

const builderConfigs: Record<string, unknown[]> = JSON.parse(
  readFileSync(join(__dirname, 'builderActionConfigs.json'), 'utf8'),
);

const malformedOf = (schema: TAutomationConfigSchema, config: unknown) => {
  const parsed = schema.safeParse(config);

  return parsed.success
    ? []
    : toAutomationConfigIssues(parsed.error, config).filter(
        ({ malformed }) => malformed,
      );
};

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
