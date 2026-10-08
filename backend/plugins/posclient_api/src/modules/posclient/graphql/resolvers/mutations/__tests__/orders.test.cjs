const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

class ExpectedError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

const validationError = new Error('Order validation reached');
const filename = path.resolve(__dirname, '../orders.ts');
const moduleObject = { exports: {} };
const dependencies = {
  '@/posclient/db/definitions/constants': { ORDER_STATUSES: {} },
  '@/posclient/utils/orderUtils': {
    checkOrderStatus: () => {},
    validateOrder: async (subdomain, models, config) => {
      assert.equal(subdomain, 'tenant');
      assert.equal(config.token, 'pos');
      throw validationError;
    },
  },
  'erxes-api-shared/utils': {
    ExpectedError,
    markResolvers: (resolvers, { wrapperConfig }) => {
      for (const resolver of Object.values(resolvers)) {
        resolver.wrapperConfig = wrapperConfig;
      }
    },
  },
  '~/modules/posclient/utils/assertPosUser': {
    assertPosUser: (user) => {
      if (!user) throw new Error('POS user required');
    },
  },
};
vm.runInNewContext(
  ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  {
    exports: moduleObject.exports,
    module: moduleObject,
    require: (name) => dependencies[name] || {},
  },
  { filename },
);
const mutations = moduleObject.exports.default;
const context = {
  subdomain: 'tenant',
  models: { Orders: { getOrder: async () => ({ _id: 'order' }) } },
  config: { token: 'pos' },
  clientPortal: { _id: 'portal' },
};

for (const name of ['cpOrdersAdd', 'cpOrdersEdit']) {
  test(`${name} requires portal context through the public wrapper`, () => {
    assert.equal(mutations[name].wrapperConfig.forClientPortal, true);
    assert.equal(mutations[name].wrapperConfig.cpUserRequired, undefined);
  });

  test(`${name} allows visitors without a portal user and validates orders`, async () => {
    await assert.rejects(
      mutations[name](null, { _id: 'order', customerType: 'visitor' }, context),
      (error) => error === validationError,
    );
  });

  test(`${name} rejects non-visitors without a portal user`, async () => {
    for (const customerType of ['customer', 'company', undefined]) {
      await assert.rejects(
        mutations[name](null, { _id: 'order', customerType }, context),
        { message: 'Client portal user required', code: 'UNAUTHORIZED' },
      );
    }
  });

  test(`${name} allows authenticated portal users and validates orders`, async () => {
    for (const customerType of ['customer', 'company', 'visitor', undefined]) {
      await assert.rejects(
        mutations[name](
          null,
          { _id: 'order', customerType },
          {
            ...context,
            cpUser: { _id: 'customer-user' },
          },
        ),
        (error) => error === validationError,
      );
    }
  });
}

test('regular POS visitor creation still requires a POS user', async () => {
  await assert.rejects(
    mutations.ordersAdd(null, { customerType: 'visitor' }, context),
    { message: 'POS user required' },
  );
});
