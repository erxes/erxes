import { test } from 'node:test';
import { deepStrictEqual, notStrictEqual, ok, strictEqual } from 'node:assert';
import { Module } from 'node:module';
import { Mongoose, Schema } from 'mongoose';
import type {
  IViberConversation,
  IViberConversationDocument,
} from '../../../@types/conversation';
import type { IViberConversationModel } from '../../models/Conversations';

// The installed Node types do not export the callback context by name.
type TestContext = Parameters<NonNullable<Parameters<typeof test>[0]>>[0];

const VALID_MAPPING: IViberConversation = {
  inboxId: 'inbox-test',
  userId: 'viber-user-test',
  conversationId: 'frontline-conversation-test',
};

const createSchemaHarness = (t: TestContext) => {
  // Resolve indirectly so the shared barrel is not a lazy import in Nx's graph.
  const [utilsPath, schemaPath, loaderPath] = [
    'erxes-api-shared/utils',
    '../conversations',
    '../../models/Conversations',
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
    default: () => 'viber-conversation-mapping-test',
  };
  const replacement = new Module(utilsPath);
  replacement.filename = utilsPath;
  replacement.loaded = true;
  replacement.exports = { mongooseStringRandomId: idDefinition };
  require.cache[utilsPath] = replacement;
  delete require.cache[schemaPath];
  delete require.cache[loaderPath];

  const {
    viberConversationSchema,
  }: typeof import('../conversations') = require('../conversations');
  const {
    loadViberConversationClass,
  }: typeof import('../../models/Conversations') = require('../../models/Conversations');

  const mongoose = new Mongoose();
  const Conversation = mongoose.model<
    IViberConversationDocument,
    IViberConversationModel
  >('viber_conversations', loadViberConversationClass());
  t.after(() => {
    mongoose.deleteModel('viber_conversations');
  });

  return {
    Conversation,
    viberConversationSchema,
    loadViberConversationClass,
    idDefinition,
  };
};

test('the Viber conversation loader returns its schema', (t) => {
  const { viberConversationSchema, loadViberConversationClass } =
    createSchemaHarness(t);

  ok(viberConversationSchema instanceof Schema);
  strictEqual(loadViberConversationClass(), viberConversationSchema);
});

test('accepts separate inbox, sender, mapping, and Frontline conversation ids', (t) => {
  const { Conversation } = createSchemaHarness(t);
  const mapping = new Conversation(VALID_MAPPING);
  const conversationId: string = mapping.conversationId;

  strictEqual(mapping.validateSync(), undefined);
  strictEqual(mapping.inboxId, VALID_MAPPING.inboxId);
  strictEqual(mapping.userId, VALID_MAPPING.userId);
  strictEqual(conversationId, VALID_MAPPING.conversationId);
  notStrictEqual(mapping._id, conversationId);
});

test('uses the shared string-id definition and keeps the mapping id typed as a string', (t) => {
  const { Conversation, viberConversationSchema, idDefinition } =
    createSchemaHarness(t);
  const mapping = new Conversation(VALID_MAPPING);
  const id: string = mapping._id;

  strictEqual(viberConversationSchema.obj._id, idDefinition);
  strictEqual(viberConversationSchema.path('_id').instance, 'String');
  strictEqual(id, 'viber-conversation-mapping-test');
});

for (const field of ['inboxId', 'userId', 'conversationId'] as const) {
  test(`requires a non-empty conversation mapping ${field}`, (t) => {
    const { Conversation, viberConversationSchema } = createSchemaHarness(t);

    strictEqual(viberConversationSchema.path(field).instance, 'String');

    for (const value of [undefined, null, '']) {
      const mapping = new Conversation({ ...VALID_MAPPING, [field]: value });
      const error = mapping.validateSync();

      ok(error);
      strictEqual(error.errors[field]?.kind, 'required');
    }
  });
}

test('declares one conversation mapping per inbox and sender pair, not per field', (t) => {
  const { viberConversationSchema } = createSchemaHarness(t);
  const uniqueIndexes = viberConversationSchema
    .indexes()
    .filter(([, options]) => options.unique)
    .map(([fields]) => fields);

  deepStrictEqual(uniqueIndexes, [{ inboxId: 1, userId: 1 }]);
});

test('declares a lookup index on the Frontline conversation id', (t) => {
  const { viberConversationSchema } = createSchemaHarness(t);
  const conversationIndexes = viberConversationSchema
    .indexes()
    .filter(([fields]) => fields.conversationId === 1);

  strictEqual(conversationIndexes.length, 1);
  deepStrictEqual(conversationIndexes[0][0], { conversationId: 1 });
  strictEqual(Boolean(conversationIndexes[0][1].unique), false);
});
