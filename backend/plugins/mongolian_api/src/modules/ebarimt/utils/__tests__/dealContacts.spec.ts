import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { getDealContactIds } from '../dealContacts';
import { checkBillType } from '../index';
import { generateModels } from '~/connectionResolvers';
import { dealToDynamic } from '@/msdynamic/utils';
import { getMsdCustomerInfo } from '@/msdynamic/utilsCustomer';
import { getConfigPostData, getMoveData } from '@/erkhet/utils/ebarimtData';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));
jest.mock('~/connectionResolvers', () => ({
  generateModels: jest.fn().mockResolvedValue({
    SyncLogsMSD: {
      findOne: jest.fn().mockResolvedValue({ _id: 'log-1' }),
      updateOne: jest.fn(),
    },
  }),
}));
jest.mock('@/msdynamic/utilsCustomer', () => ({
  getMsdCustomerInfo: jest.fn(),
}));
jest.mock('node-fetch', () => jest.fn());
jest.mock('@/erkhet/utils/productsByTaxType', () => ({
  calcProductsTaxRule: jest.fn().mockResolvedValue({ productsById: {} }),
}));

const sendMessage = jest.mocked(sendTRPCMessage);
const config = { checkTaxpayerUrl: 'https://taxpayer.test' };
const deal = {
  _id: 'deal-1',
  companyId: 'company-1',
  customerId: 'customer-1',
};
const originalFetch = global.fetch;

beforeEach(() => {
  jest.clearAllMocks();
  sendMessage.mockImplementation(async ({ module, defaultValue }) => {
    if (module === 'companies')
      return [{ code: '1234567', primaryName: 'Company' }];
    if (module === 'customers')
      return [{ code: '12345678', firstName: 'Customer' }];
    return defaultValue;
  });
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ status: 200, data: '12345678901' }),
  });
});

afterAll(() => {
  global.fetch = originalFetch;
});

it('uses direct contacts without querying relations', async () => {
  expect(await getDealContactIds('tenant', deal, 'company')).toEqual([
    'company-1',
  ]);
  expect(await getDealContactIds('tenant', deal, 'customer')).toEqual([
    'customer-1',
  ]);
  expect(
    await getDealContactIds('tenant', { _id: 'd', companyId: null }, 'company'),
  ).toEqual([]);
  expect(sendMessage).not.toHaveBeenCalled();
});

it('loads the deal by id using the sales public contract and tenant', async () => {
  sendMessage.mockResolvedValueOnce(deal);
  expect(await getDealContactIds('tenant', 'deal-1', 'company')).toEqual([
    'company-1',
  ]);
  expect(sendMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      subdomain: 'tenant',
      pluginName: 'sales',
      module: 'deal',
      action: 'findOne',
      input: { _id: 'deal-1' },
    }),
  );
});

it('selects B2B from companyId and B2C from customerId', async () => {
  expect(await checkBillType('tenant', config, deal)).toMatchObject({
    type: 'B2B_RECEIPT',
    customerCode: '1234567',
    customerTin: '12345678901',
  });
  expect(
    await checkBillType('tenant', config, { ...deal, companyId: null }),
  ).toMatchObject({
    type: 'B2C_RECEIPT',
    customerCode: '12345678',
    customerName: 'Customer',
  });
});

it('falls back to B2C when the linked company is missing', async () => {
  sendMessage.mockResolvedValueOnce([]);
  expect(await checkBillType('tenant', config, deal)).toMatchObject({
    type: 'B2C_RECEIPT',
    customerCode: '12345678',
  });
});

it.each([
  { regNoField: 'reg', companyNameField: 'name' },
  { regNo: 'reg', companyName: 'name' },
])('reads current and legacy field mappings: %j', async (fields) => {
  expect(
    await checkBillType(
      'tenant',
      {
        ...config,
        dealBillType: { billType: 'type', ...fields },
      },
      {
        ...deal,
        propertiesData: { type: 'B2B', reg: '7654321', name: 'Mapped' },
      },
    ),
  ).toMatchObject({
    type: 'B2B_RECEIPT',
    customerCode: '7654321',
    customerName: 'Mapped',
  });
  expect(sendMessage).not.toHaveBeenCalled();
});

it('honors explicit B2C even when a company is linked', async () => {
  expect(
    await checkBillType(
      'tenant',
      {
        ...config,
        dealBillType: { billType: 'type' },
      },
      { ...deal, propertiesData: { type: 'B2C_RECEIPT' } },
    ),
  ).toMatchObject({
    type: 'B2C_RECEIPT',
    customerCode: '12345678',
  });
  expect(
    sendMessage.mock.calls.every(([input]) => input.module === 'customers'),
  ).toBe(true);
  expect(global.fetch).not.toHaveBeenCalled();
});

it('reads basic deal fields when configured', async () => {
  expect(
    await checkBillType(
      'tenant',
      {
        ...config,
        dealBillType: { groupId: 'basic', billType: 'description' },
      },
      { ...deal, description: 'B2C' },
    ),
  ).toMatchObject({ type: 'B2C_RECEIPT' });
});

it.each(['12345678901', '123456789012', '12345678901234'])(
  'keeps a company TIN %s as B2B in Erkhet sync',
  async (code) => {
    sendMessage.mockResolvedValueOnce([{ code }]);
    const data = await getConfigPostData(
      'tenant',
      {},
      {
        ...deal,
        assignedUserIds: [],
        productsData: [],
      },
      [],
    );
    expect(JSON.parse(data.orderInfos)).toEqual([
      expect.objectContaining({ billType: 3, customerCode: code }),
    ]);
  },
);

it('uses the direct company code for Erkhet movement sync', async () => {
  const data = await getMoveData(
    'tenant',
    {},
    {
      ...deal,
      assignedUserIds: [],
      productsData: [],
      expensesData: [],
    },
  );
  expect(JSON.parse(data.orderInfos)).toEqual([
    expect.objectContaining({ customerCode: '1234567' }),
  ]);
  expect(
    sendMessage.mock.calls.some(([input]) => input.module === 'conformity'),
  ).toBe(false);
});

it.each([
  {
    companyId: 'company-1',
    customerId: 'customer-1',
    expectedId: 'company-1',
    expectedType: 'company',
  },
  {
    customerId: 'customer-1',
    expectedId: 'customer-1',
    expectedType: 'customer',
  },
])(
  'selects the direct contact for MS Dynamic: %j',
  async ({ expectedId, expectedType, ...contacts }) => {
    const models = await generateModels('tenant');
    const syncLog = await models.SyncLogsMSD.findOne({ _id: 'log-1' });
    if (!syncLog) throw new Error('Missing test sync log');
    const syncConfig = {
      brandId: 'brand-1',
      customerApi: 'customer',
      salesApi: 'sales',
      salesLineApi: 'lines',
      username: 'user',
      password: 'password',
    };
    const stop = new Error('Stop after contact lookup');
    jest.mocked(getMsdCustomerInfo).mockRejectedValueOnce(stop);
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    try {
      await dealToDynamic(
        'tenant',
        models,
        syncLog,
        { _id: 'deal-1', ...contacts },
        syncConfig,
      );
      expect(getMsdCustomerInfo).toHaveBeenCalledWith(
        'tenant',
        models,
        expectedId,
        expectedType,
        'brand-1',
        syncConfig,
      );
      expect(sendMessage).not.toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  },
);
