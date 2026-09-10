import { test } from 'node:test';
import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { Module } from 'node:module';
import { Mongoose, Schema } from 'mongoose';
import type {
  IViberCustomer,
  IViberCustomerDocument,
} from '../../../@types/customer';
import type { IViberCustomerModel } from '../../models/Customers';

// The installed Node types do not export the callback context by name.
type TestContext = Parameters<NonNullable<Parameters<typeof test>[0]>>[0];

const VALID_MAPPING: IViberCustomer = {
  inboxId: 'inbox-test',
  userId: 'viber-user-test',
  contactsId: 'core-customer-test',
};

const createSchemaHarness = (t: TestContext) => {
  // Resolve mock cache keys without marking shared utilities as a lazy import
  // in Nx's dependency graph (as a literal require.resolve call would).
  const [utilsPath, schemaPath, loaderPath] = [
    'erxes-api-shared/utils',
    '../customers',
    '../../models/Customers',
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

  // The shared barrel starts infrastructure clients. Replace only this import;
  // use real Mongoose and the real Viber schema/loader without opening a DB.
  const idDefinition = {
    type: String,
    default: () => 'viber-mapping-test',
  };
  const replacement = new Module(utilsPath);
  replacement.filename = utilsPath;
  replacement.loaded = true;
  replacement.exports = { mongooseStringRandomId: idDefinition };
  require.cache[utilsPath] = replacement;
  delete require.cache[schemaPath];
  delete require.cache[loaderPath];

  const {
    viberCustomerSchema,
  }: typeof import('../customers') = require('../customers');
  const {
    loadViberCustomerClass,
  }: typeof import('../../models/Customers') = require('../../models/Customers');

  const mongoose = new Mongoose();
  const Customer = mongoose.model<IViberCustomerDocument, IViberCustomerModel>(
    'viber_customers',
    loadViberCustomerClass(),
  );
  t.after(() => {
    mongoose.deleteModel('viber_customers');
  });

  return {
    Customer,
    viberCustomerSchema,
    loadViberCustomerClass,
    idDefinition,
  };
};

test('the Viber customer loader returns its schema', (t) => {
  const { viberCustomerSchema, loadViberCustomerClass } =
    createSchemaHarness(t);

  ok(viberCustomerSchema instanceof Schema);
  strictEqual(loadViberCustomerClass(), viberCustomerSchema);
});

test('accepts a mapping with separate inbox, Viber user, and core customer ids', (t) => {
  const { Customer } = createSchemaHarness(t);
  const customer = new Customer(VALID_MAPPING);

  strictEqual(customer.validateSync(), undefined);
  strictEqual(customer.inboxId, VALID_MAPPING.inboxId);
  strictEqual(customer.userId, VALID_MAPPING.userId);
  strictEqual(customer.contactsId, VALID_MAPPING.contactsId);
});

test('uses the shared string-id definition and keeps the document id typed as a string', (t) => {
  const { Customer, viberCustomerSchema, idDefinition } =
    createSchemaHarness(t);
  const customer = new Customer(VALID_MAPPING);
  const id: string = customer._id;

  strictEqual(viberCustomerSchema.obj._id, idDefinition);
  strictEqual(viberCustomerSchema.path('_id').instance, 'String');
  strictEqual(id, 'viber-mapping-test');
});

for (const field of ['inboxId', 'userId', 'contactsId'] as const) {
  test(`requires a non-empty ${field}`, (t) => {
    const { Customer, viberCustomerSchema } = createSchemaHarness(t);

    strictEqual(viberCustomerSchema.path(field).instance, 'String');

    for (const value of [undefined, null, '']) {
      const customer = new Customer({ ...VALID_MAPPING, [field]: value });
      const error = customer.validateSync();

      ok(error);
      strictEqual(error.errors[field]?.kind, 'required');
    }
  });
}

test('declares uniqueness for the inbox and Viber user pair, not either field alone', (t) => {
  const { viberCustomerSchema } = createSchemaHarness(t);
  const uniqueIndexes = viberCustomerSchema
    .indexes()
    .filter(([, options]) => options.unique)
    .map(([fields]) => fields);

  deepStrictEqual(uniqueIndexes, [{ inboxId: 1, userId: 1 }]);
});
