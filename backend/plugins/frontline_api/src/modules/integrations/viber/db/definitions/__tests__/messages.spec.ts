import { test } from 'node:test';
import { deepStrictEqual, notStrictEqual, ok, strictEqual } from 'node:assert';
import { Module } from 'node:module';
import { Mongoose, Schema } from 'mongoose';
import type {
  IViberMessage,
  IViberMessageDocument,
} from '../../../@types/message';
import type { IViberMessageModel } from '../../models/Messages';

// The installed Node types do not export the callback context by name.
type TestContext = Parameters<NonNullable<Parameters<typeof test>[0]>>[0];

const VALID_MAPPING: IViberMessage = {
  inboxId: 'inbox-test',
  messageToken: '4912661846655238145',
  messageId: 'frontline-message-test',
};

const createSchemaHarness = (t: TestContext) => {
  // Resolve indirectly so the shared barrel is not a lazy import in Nx's graph.
  const [utilsPath, schemaPath, loaderPath] = [
    'erxes-api-shared/utils',
    '../messages',
    '../../models/Messages',
  ].map((specifier) => require.resolve(specifier));
  const originalModules = new Map(
    [utilsPath, schemaPath, loaderPath].map((filename) => [
      filename,
      require.cache[filename],
    ]),
  );

  t.after(() => {
    for (const [filename, original] of originalModules) {
      if (original) {
        require.cache[filename] = original;
      } else {
        delete require.cache[filename];
      }
    }
  });

  // Use the real schema/loader and Mongoose without starting shared clients.
  const idDefinition = {
    type: String,
    default: () => 'viber-message-mapping-test',
  };
  const replacement = new Module(utilsPath);
  replacement.filename = utilsPath;
  replacement.loaded = true;
  replacement.exports = { mongooseStringRandomId: idDefinition };
  require.cache[utilsPath] = replacement;
  delete require.cache[schemaPath];
  delete require.cache[loaderPath];

  const {
    viberMessageSchema,
  }: typeof import('../messages') = require('../messages');
  const {
    loadViberMessageClass,
  }: typeof import('../../models/Messages') = require('../../models/Messages');

  const mongoose = new Mongoose();
  const Message = mongoose.model<IViberMessageDocument, IViberMessageModel>(
    'viber_messages',
    loadViberMessageClass(),
  );
  t.after(() => {
    mongoose.deleteModel('viber_messages');
  });

  return { Message, viberMessageSchema, loadViberMessageClass, idDefinition };
};

test('the Viber message loader returns its schema', (t) => {
  const { viberMessageSchema, loadViberMessageClass } = createSchemaHarness(t);

  ok(viberMessageSchema instanceof Schema);
  strictEqual(loadViberMessageClass(), viberMessageSchema);
});

test('accepts separate inbox, provider token, mapping, and Frontline message ids', (t) => {
  const { Message } = createSchemaHarness(t);
  const mapping = new Message(VALID_MAPPING);
  const messageId: string = mapping.messageId;

  strictEqual(mapping.validateSync(), undefined);
  strictEqual(mapping.inboxId, VALID_MAPPING.inboxId);
  strictEqual(mapping.messageToken, VALID_MAPPING.messageToken);
  strictEqual(messageId, VALID_MAPPING.messageId);
  notStrictEqual(mapping._id, messageId);
  notStrictEqual(mapping._id, mapping.messageToken);
});

test('uses the shared string-id definition and keeps the mapping id typed as a string', (t) => {
  const { Message, viberMessageSchema, idDefinition } = createSchemaHarness(t);
  const mapping = new Message(VALID_MAPPING);
  const id: string = mapping._id;

  strictEqual(viberMessageSchema.obj._id, idDefinition);
  strictEqual(viberMessageSchema.path('_id').instance, 'String');
  strictEqual(id, 'viber-message-mapping-test');
});

for (const field of ['inboxId', 'messageToken', 'messageId'] as const) {
  test(`requires a non-empty message mapping ${field}`, (t) => {
    const { Message, viberMessageSchema } = createSchemaHarness(t);

    strictEqual(viberMessageSchema.path(field).instance, 'String');

    for (const value of [undefined, null, '']) {
      const mapping = new Message({ ...VALID_MAPPING, [field]: value });
      const error = mapping.validateSync();

      ok(error);
      strictEqual(error.errors[field]?.kind, 'required');
    }
  });
}

test('declares uniqueness for the inbox/token pair and the Frontline message id', (t) => {
  const { viberMessageSchema } = createSchemaHarness(t);
  const uniqueIndexes = viberMessageSchema
    .indexes()
    .filter(([, options]) => options.unique)
    .map(([fields]) => fields);

  deepStrictEqual(uniqueIndexes, [
    { messageId: 1 },
    { inboxId: 1, messageToken: 1 },
  ]);
});

test('preserves large numeric token strings and leading zeroes exactly', (t) => {
  const { Message } = createSchemaHarness(t);

  for (const messageToken of [
    '4912661846655238145',
    '18446744073709551615',
    '0004912661846655238145',
  ]) {
    const mapping = new Message({ ...VALID_MAPPING, messageToken });
    const token: string = mapping.messageToken;

    strictEqual(mapping.validateSync(), undefined);
    strictEqual(token, messageToken);
    strictEqual(typeof token, 'string');
    strictEqual(mapping.toObject().messageToken, messageToken);
  }
});

test('leaves a new reservation unprocessed without a completion timestamp default', (t) => {
  const { Message, viberMessageSchema } = createSchemaHarness(t);
  const mapping = new Message(VALID_MAPPING);
  const processedAt: Date | undefined = mapping.processedAt;

  strictEqual(mapping.validateSync(), undefined);
  strictEqual(viberMessageSchema.path('processedAt').instance, 'Date');
  strictEqual(
    viberMessageSchema.path('processedAt').options.default,
    undefined,
  );
  strictEqual(processedAt, undefined);
  strictEqual('processedAt' in mapping.toObject(), false);
});

test('accepts an explicit completion timestamp without changing it', (t) => {
  const { Message } = createSchemaHarness(t);
  const processedAt = new Date('2026-09-14T04:05:06.789Z');
  const mapping = new Message({ ...VALID_MAPPING, processedAt });

  strictEqual(mapping.validateSync(), undefined);
  ok(mapping.processedAt instanceof Date);
  strictEqual(mapping.processedAt.getTime(), processedAt.getTime());
});

test('rejects an invalid completion timestamp', (t) => {
  const { Message } = createSchemaHarness(t);
  const mapping = new Message({
    ...VALID_MAPPING,
    processedAt: new Date('invalid'),
  });
  const error = mapping.validateSync();

  ok(error);
  strictEqual(error.errors.processedAt?.name, 'CastError');
});
