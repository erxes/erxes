import { z } from 'zod/v4';
import {
  checkAutomationNodeConfigs,
  isAutomationConfigSchema,
  toTransportConfigSchema,
} from './configSchema';
import {
  buildConfigContractIndex,
  normalizeAutomationConstantsForTransport,
} from './outputResolvers';
import { AutomationConstants } from './types';

const createDealConfigSchema = z.object({
  stageId: z.string().min(1).meta({ ref: 'sales:stage' }),
  name: z.string().optional(),
  priority: z.number().default(0),
});

const constants: AutomationConstants = {
  triggers: [
    {
      type: 'sales:sales.deals',
      icon: 'IconPigMoney',
      label: 'Deal',
      description: 'Deal changes',
    },
  ],
  actions: [
    {
      moduleName: 'sales',
      collectionName: 'deals',
      icon: 'IconPigMoney',
      label: 'Create deal',
      description: 'Create a deal',
      configSchema: createDealConfigSchema,
      validateConfig: async () => [],
    },
  ],
};

describe('toTransportConfigSchema', () => {
  it('publishes the input side, so defaulted fields stay optional', () => {
    const published = toTransportConfigSchema(createDealConfigSchema);

    expect(published).toMatchObject({
      type: 'object',
      required: ['stageId'],
      properties: {
        stageId: { type: 'string', minLength: 1, ref: 'sales:stage' },
        priority: { type: 'number', default: 0 },
      },
    });
    expect(published).not.toHaveProperty('$schema');
  });

  it('converts each schema once', () => {
    expect(toTransportConfigSchema(createDealConfigSchema)).toBe(
      toTransportConfigSchema(createDealConfigSchema),
    );
  });

  it('ignores anything that is not a live schema, such as its JSON copy', () => {
    const jsonCopy: unknown = JSON.parse(
      JSON.stringify(createDealConfigSchema),
    );

    expect(isAutomationConfigSchema(jsonCopy)).toBe(false);
    expect(toTransportConfigSchema(jsonCopy)).toBeUndefined();
    expect(toTransportConfigSchema({ type: 'object' })).toBeUndefined();
  });
});

describe('checkAutomationNodeConfigs', () => {
  const tenant = { subdomain: 'tenant' };
  const contracts = {
    'sales:sales.deals.create': { schema: createDealConfigSchema },
  };

  it('reports each node by its own schema, and leaves undeclared types unchecked', async () => {
    expect(
      await checkAutomationNodeConfigs(
        contracts,
        [
          {
            id: 'a1',
            type: 'sales:sales.deals.create',
            config: { stageId: 's1' },
          },
          {
            id: 'a2',
            type: 'sales:sales.deals.create',
            config: { stageId: '' },
          },
          { id: 'a3', type: 'delay', config: {} },
        ],
        tenant,
      ),
    ).toEqual([
      { id: 'a1', type: 'sales:sales.deals.create', status: 'valid' },
      {
        id: 'a2',
        type: 'sales:sales.deals.create',
        status: 'invalid',
        issues: [
          {
            check: 'schema',
            path: 'config.stageId',
            message: expect.stringContaining('>=1'),
          },
        ],
      },
      { id: 'a3', type: 'delay', status: 'unchecked' },
    ]);
  });

  it('treats a missing config as an empty one', async () => {
    const [check] = await checkAutomationNodeConfigs(
      contracts,
      [{ id: 'a1', type: 'sales:sales.deals.create' }],
      tenant,
    );

    expect(check.status).toBe('invalid');
  });

  it('runs the tenant rules on the parsed config, only once the schema accepts it', async () => {
    const validate = jest.fn(async ({ config }) =>
      config.stageId === 'lost'
        ? [{ path: 'config.stageId', message: 'Stage "lost" does not exist' }]
        : [],
    );
    const withRules = {
      'sales:sales.deals.create': { schema: createDealConfigSchema, validate },
    };

    const checks = await checkAutomationNodeConfigs(
      withRules,
      [
        {
          id: 'a1',
          type: 'sales:sales.deals.create',
          config: { stageId: 'lost' },
        },
        {
          id: 'a2',
          type: 'sales:sales.deals.create',
          config: { stageId: 's1' },
        },
        { id: 'a3', type: 'sales:sales.deals.create', config: { stageId: '' } },
      ],
      tenant,
    );

    expect(checks.map(({ status }) => status)).toEqual([
      'invalid',
      'valid',
      'invalid',
    ]);
    expect(checks[0].issues).toEqual([
      {
        check: 'records',
        path: 'config.stageId',
        message: 'Stage "lost" does not exist',
      },
    ]);
    expect(validate).toHaveBeenCalledTimes(2);
    expect(validate).toHaveBeenCalledWith({
      subdomain: 'tenant',
      config: { stageId: 'lost', priority: 0 },
    });
  });

  it('leaves a node unchecked when its tenant rules cannot run', async () => {
    const [check] = await checkAutomationNodeConfigs(
      {
        'sales:sales.deals.create': {
          schema: createDealConfigSchema,
          validate: async () => {
            throw new Error('database unavailable');
          },
        },
      },
      [
        {
          id: 'a1',
          type: 'sales:sales.deals.create',
          config: { stageId: 's1' },
        },
      ],
      tenant,
    );

    expect(check.status).toBe('unchecked');
  });
});

describe('config schemas across transport', () => {
  it('replaces the schema with its JSON form for the wire', () => {
    const [action] =
      normalizeAutomationConstantsForTransport('sales', constants).actions ||
      [];

    expect(action.type).toBe('sales:sales.deals.create');
    expect(action).not.toHaveProperty('configSchema');
    expect(action).not.toHaveProperty('validateConfig');
    expect(action.configJsonSchema).toMatchObject({ required: ['stageId'] });
  });

  it('keeps the published form when constants come back from service discovery', () => {
    const fromRedis: AutomationConstants = JSON.parse(
      JSON.stringify(
        normalizeAutomationConstantsForTransport('sales', constants),
      ),
    );
    const [action] =
      normalizeAutomationConstantsForTransport('sales', fromRedis).actions ||
      [];

    expect(action.configJsonSchema).toMatchObject({ required: ['stageId'] });
  });

  it('indexes the live contracts by the node type the engine stores', () => {
    const index = buildConfigContractIndex('sales', constants);

    expect(Object.keys(index)).toEqual(['sales:sales.deals.create']);
    expect(index['sales:sales.deals.create']).toEqual({
      schema: createDealConfigSchema,
      validate: constants.actions?.[0].validateConfig,
    });
  });
});
