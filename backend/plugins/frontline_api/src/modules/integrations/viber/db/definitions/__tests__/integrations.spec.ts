import { test } from 'node:test';
import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { Module } from 'node:module';
import { Mongoose, Schema } from 'mongoose';
import type {
  IViberIntegration,
  IViberIntegrationDocument,
} from '../../../@types/integration';
import type { IViberIntegrationModel } from '../../models/Integrations';
import { VIBER_HEALTH_STATUSES } from '../../../constants';
import type { TestContext } from '../../../__tests__/helperHarness';

const VALID_INTEGRATION: IViberIntegration = {
  inboxId: 'inbox-test',
  botId: 'viber-bot-test',
  token: 'test-viber-token',
};

const createSchemaHarness = (t: TestContext) => {
  const [utilsPath, schemaPath, loaderPath] = [
    'erxes-api-shared/utils',
    '../integrations',
    '../../models/Integrations',
  ].map((specifier) => require.resolve(specifier));
  const originals = new Map(
    [utilsPath, schemaPath, loaderPath].map((filename) => [
      filename,
      require.cache[filename],
    ]),
  );
  t.after(() => {
    for (const [filename, original] of originals) {
      if (original) {
        require.cache[filename] = original;
      } else {
        delete require.cache[filename];
      }
    }
  });

  // Keep real Mongoose/schema behavior without starting shared service clients.
  const idDefinition = {
    type: String,
    default: () => 'viber-integration-test',
  };
  const replacement = new Module(utilsPath);
  replacement.filename = utilsPath;
  replacement.loaded = true;
  replacement.exports = { mongooseStringRandomId: idDefinition };
  require.cache[utilsPath] = replacement;
  delete require.cache[schemaPath];
  delete require.cache[loaderPath];

  const {
    viberIntegrationSchema,
  }: typeof import('../integrations') = require('../integrations');
  const {
    loadViberIntegrationClass,
  }: typeof import('../../models/Integrations') = require('../../models/Integrations');
  const mongoose = new Mongoose();
  const Integration = mongoose.model<
    IViberIntegrationDocument,
    IViberIntegrationModel
  >('viber_integrations', loadViberIntegrationClass());
  t.after(() => mongoose.deleteModel('viber_integrations'));

  return {
    Integration,
    viberIntegrationSchema,
    loadViberIntegrationClass,
    idDefinition,
  };
};

test('the integration loader retains the schema and shared string-id definition', (t) => {
  const {
    Integration,
    viberIntegrationSchema,
    loadViberIntegrationClass,
    idDefinition,
  } = createSchemaHarness(t);
  const integration = new Integration(VALID_INTEGRATION);
  const id: string = integration._id;

  ok(viberIntegrationSchema instanceof Schema);
  strictEqual(loadViberIntegrationClass(), viberIntegrationSchema);
  strictEqual(viberIntegrationSchema.obj._id, idDefinition);
  strictEqual(id, 'viber-integration-test');
});

test('a new integration starts pending with no error, never implicitly healthy', (t) => {
  const { Integration } = createSchemaHarness(t);
  const integration = new Integration(VALID_INTEGRATION);

  strictEqual(integration.validateSync(), undefined);
  strictEqual(integration.healthStatus, 'pending');
  strictEqual(integration.error, '');
});

test('accepts the three exact health-status values used by the Viber contract', (t) => {
  const { Integration } = createSchemaHarness(t);

  deepStrictEqual(Object.values(VIBER_HEALTH_STATUSES), [
    'pending',
    'healthy',
    'unHealthy',
  ]);
  for (const healthStatus of Object.values(VIBER_HEALTH_STATUSES)) {
    const integration = new Integration({ ...VALID_INTEGRATION, healthStatus });

    strictEqual(integration.validateSync(), undefined);
    strictEqual(integration.healthStatus, healthStatus);
  }
});

test('rejects unsupported health statuses and an explicitly removed required status', (t) => {
  const { Integration } = createSchemaHarness(t);

  for (const healthStatus of ['unknown', 'unhealthy', 'HEALTHY', null, '']) {
    const integration = new Integration({ ...VALID_INTEGRATION, healthStatus });
    const error = integration.validateSync();

    ok(
      error?.errors.healthStatus,
      `Expected rejection for ${String(healthStatus)}`,
    );
  }

  const integration = new Integration(VALID_INTEGRATION);
  integration.healthStatus = undefined;
  strictEqual(
    integration.validateSync()?.errors.healthStatus?.kind,
    'required',
  );
});

test('hydrates legacy records with defaults without changing their raw input', (t) => {
  const { Integration } = createSchemaHarness(t);
  const raw = { _id: 'legacy-integration', ...VALID_INTEGRATION };
  const integration = Integration.hydrate(raw);

  strictEqual(integration.isNew, false);
  strictEqual(integration.healthStatus, 'pending');
  strictEqual(integration.error, '');
  strictEqual(integration.validateSync(), undefined);
  deepStrictEqual(raw, { _id: 'legacy-integration', ...VALID_INTEGRATION });
});

test('preserves a supplied failure state and error instead of applying defaults', (t) => {
  const { Integration } = createSchemaHarness(t);
  const integration = Integration.hydrate({
    _id: 'failed-integration',
    ...VALID_INTEGRATION,
    healthStatus: VIBER_HEALTH_STATUSES.UNHEALTHY,
    error: 'Webhook registration could not be confirmed',
  });

  strictEqual(integration.validateSync(), undefined);
  strictEqual(integration.healthStatus, 'unHealthy');
  strictEqual(integration.error, 'Webhook registration could not be confirmed');
});

test('keeps the token excluded by default and the existing identity indexes unchanged', (t) => {
  const { Integration, viberIntegrationSchema } = createSchemaHarness(t);

  strictEqual(viberIntegrationSchema.path('token').options.select, false);
  const integration = new Integration(VALID_INTEGRATION);
  strictEqual(integration.token, VALID_INTEGRATION.token);
  deepStrictEqual(
    viberIntegrationSchema
      .indexes()
      .filter(([, options]) => options.unique)
      .map(([fields]) => fields),
    [{ inboxId: 1 }, { botId: 1 }],
  );
});

test('the new status fields do not replace required connection credentials and identities', (t) => {
  const { Integration } = createSchemaHarness(t);

  for (const field of ['inboxId', 'botId', 'token'] as const) {
    const integration = new Integration({
      ...VALID_INTEGRATION,
      [field]: undefined,
    });
    strictEqual(integration.validateSync()?.errors[field]?.kind, 'required');
  }
});
