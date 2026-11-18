import {
  execute,
  GraphQLInputObjectType,
  GraphQLObjectType,
  parse,
  printSchema,
  specifiedRules,
  validate,
} from 'graphql';
import {
  DATA_EXTENSION_RECORD_TYPES,
  IDataExtensionField,
  IDataExtensionRecord,
} from 'erxes-api-shared/core-modules';
import { IRequestContext } from '~/modules/data-extensions/runtime/context';
import {
  maxAliasesRule,
  maxDepthRule,
} from '~/modules/data-extensions/runtime/limits';
import { buildTenantSchema, IOwnerResolvers } from './buildSchema';

const field = (
  recordType: string,
  key: string,
  type: IDataExtensionField['type'],
  options?: IDataExtensionField['options'],
): IDataExtensionField => ({
  recordType,
  key,
  label: `Label "${key}"`,
  type,
  options,
  order: 0,
  status: 'active',
});

const fields = [
  field('core:company', 'accountReference', 'text'),
  field('core:company', 'inspectionDueAt', 'date'),
  field('core:company', 'tier', 'select', [{ value: 'gold', label: 'Gold' }]),
  field('operation:task', 'storyPoints', 'number'),
];

const record: IDataExtensionRecord = {
  _id: 'company-1',
  native: { primaryName: 'Acme', industry: ['Retail'] },
  dataExtensions: {
    accountReference: 'ACC-204',
    inspectionDueAt: '2027-06-01T00:00:00.000Z',
  },
};

const task: IDataExtensionRecord = {
  _id: '507f1f77bcf86cd799439011',
  native: { name: 'Prepare inspection' },
  dataExtensions: { storyPoints: 8, account: 'company-1' },
};

const createOwners = () => {
  const calls: { method: string; args: unknown[] }[] = [];
  const owners: IOwnerResolvers = {
    async load(_context, descriptor, ids) {
      calls.push({ method: 'load', args: [descriptor.recordType, ids] });
      return ids.map((id) => (id === record._id ? record : null));
    },
    async patch(_context, descriptor, id, values) {
      calls.push({
        method: 'patch',
        args: [descriptor.recordType, id, values],
      });
      return {
        ...record,
        dataExtensions: { ...record.dataExtensions, ...values },
      };
    },
    async findByRelation(_context, descriptor, key, targetId, limit) {
      calls.push({
        method: 'findByRelation',
        args: [descriptor.recordType, key, targetId, limit],
      });
      return [task];
    },
    async search(_context, descriptor, searchValue, limit) {
      calls.push({
        method: 'search',
        args: [descriptor.recordType, searchValue, limit],
      });
      return [record];
    },
    async link(_context, descriptor, key, ids, targetId, action) {
      calls.push({
        method: 'link',
        args: [descriptor.recordType, key, ids, targetId, action],
      });
      return ids;
    },
  };

  return { owners, calls };
};

const createContext = (denied: string[] = []) => {
  const checked: string[] = [];
  const context = {
    subdomain: 'tenant-a',
    user: { _id: 'user-1' },
    loaders: new Map(),
    relationLoaders: new Map(),
    consumeRecords: () => undefined,
    async requirePermission(action: string) {
      checked.push(action);

      if (denied.includes(action)) {
        throw new Error('Permission required');
      }
    },
  } as unknown as IRequestContext;

  return { context, checked };
};

const run = async (
  source: string,
  options: { denied?: string[]; variables?: Record<string, unknown> } = {},
) => {
  const { owners, calls } = createOwners();
  const schema = buildTenantSchema({
    version: 7,
    recordTypes: DATA_EXTENSION_RECORD_TYPES,
    fields,
    owners,
  });
  const { context, checked } = createContext(options.denied);
  const result = await execute({
    schema,
    document: parse(source),
    contextValue: context,
    variableValues: options.variables,
  });

  return { result, calls, checked };
};

describe('buildTenantSchema', () => {
  it('generates typed values and patch inputs per record type', () => {
    const { owners } = createOwners();
    const sdl = printSchema(
      buildTenantSchema({
        version: 7,
        recordTypes: DATA_EXTENSION_RECORD_TYPES,
        fields,
        owners,
      }),
    );

    expect(sdl).toContain('type CompanyDataExtensions {');
    expect(sdl).toContain('inspectionDueAt: Date');
    expect(sdl).toContain('input CompanyDataExtensionsPatch {');
    expect(sdl).toContain(
      'companyDataExtensionsPatch(_id: ID!, values: CompanyDataExtensionsPatch!): Company',
    );
    expect(sdl).toContain('storyPoints: Float');
    // A record type without fields gets lookups but no values or patch.
    expect(sdl).toContain('lead(_id: ID!): Lead');
    expect(sdl).not.toContain('LeadDataExtensions');
    expect(sdl).not.toContain('leadDataExtensionsPatch');
    // Team members never expose credentials.
    expect(sdl).not.toMatch(/password|Token|permissionGroupIds/);
  });

  it('reads a record after checking the read permission', async () => {
    const { result, checked, calls } = await run(`{
      company(_id: "company-1") {
        _id primaryName industry
        dataExtensions { accountReference inspectionDueAt tier }
      }
      dataExtensionsVersion
    }`);

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      company: {
        _id: 'company-1',
        primaryName: 'Acme',
        industry: ['Retail'],
        dataExtensions: {
          accountReference: 'ACC-204',
          inspectionDueAt: '2027-06-01T00:00:00.000Z',
          tier: null,
        },
      },
      dataExtensionsVersion: 7,
    });
    expect(checked).toEqual(['contactsRead']);
    expect(calls).toEqual([
      { method: 'load', args: ['core:company', ['company-1']] },
    ]);
  });

  it('refuses reads without permission and never calls the owner', async () => {
    const { result, calls } = await run(
      '{ company(_id: "company-1") { _id } }',
      { denied: ['contactsRead'] },
    );

    expect(result.errors?.[0].message).toBe('Permission required');
    expect(calls).toEqual([]);
  });

  it('patches only supplied keys and keeps explicit nulls', async () => {
    const { result, calls, checked } = await run(
      `mutation Patch($values: CompanyDataExtensionsPatch!) {
        companyDataExtensionsPatch(_id: "company-1", values: $values) {
          dataExtensions { accountReference tier }
        }
      }`,
      { variables: { values: { accountReference: 'ACC-9', tier: null } } },
    );

    expect(result.errors).toBeUndefined();
    expect(checked).toEqual(['contactsRead', 'contactsUpdate']);
    expect(calls[0]).toEqual({
      method: 'patch',
      args: [
        'core:company',
        'company-1',
        { accountReference: 'ACC-9', tier: null },
      ],
    });
  });

  it('bulk patches items independently', async () => {
    const { result, calls } = await run(
      `mutation {
        companyDataExtensionsPatchMany(items: [
          { _id: "company-1", values: { tier: "gold" } }
          { _id: "company-2", values: { accountReference: "B" } }
        ]) { _id ok error record { _id } }
      }`,
    );

    expect(result.errors).toBeUndefined();
    expect(result.data?.companyDataExtensionsPatchMany).toEqual([
      { _id: 'company-1', ok: true, error: null, record: { _id: 'company-1' } },
      { _id: 'company-2', ok: true, error: null, record: { _id: 'company-1' } },
    ]);
    expect(calls.filter((call) => call.method === 'patch')).toHaveLength(2);
  });

  it('reports a failing bulk item without failing the rest', async () => {
    const { owners } = createOwners();
    const failing: IOwnerResolvers = {
      ...owners,
      async patch(context, descriptor, id, values) {
        if (id === 'bad') {
          throw new Error('tier must be one of its options');
        }

        return owners.patch(context, descriptor, id, values);
      },
    };
    const schema = buildTenantSchema({
      version: 1,
      recordTypes: DATA_EXTENSION_RECORD_TYPES,
      fields,
      owners: failing,
    });
    const { context } = createContext();
    const result = await execute({
      schema,
      document: parse(`mutation {
        companyDataExtensionsPatchMany(items: [
          { _id: "bad", values: { tier: "x" } }
          { _id: "company-1", values: { tier: "gold" } }
        ]) { _id ok error }
      }`),
      contextValue: context,
    });

    expect(result.data?.companyDataExtensionsPatchMany).toEqual([
      { _id: 'bad', ok: false, error: 'tier must be one of its options' },
      { _id: 'company-1', ok: true, error: null },
    ]);
  });

  it('requires update permission for patches', async () => {
    const { result, calls } = await run(
      'mutation { companyDataExtensionsPatch(_id: "company-1", values: { tier: "gold" }) { _id } }',
      { denied: ['contactsUpdate'] },
    );

    expect(result.errors?.[0].message).toBe('Permission required');
    expect(calls).toEqual([]);
  });

  it('keeps tenant labels out of type names', () => {
    const { owners } = createOwners();
    const schema = buildTenantSchema({
      version: 1,
      recordTypes: DATA_EXTENSION_RECORD_TYPES,
      fields: [
        {
          ...field('core:company', 'note', 'text'),
          label: '"} type Injected { x: String',
        },
      ],
      owners,
    });

    expect(schema.getType('Injected')).toBeUndefined();
  });
});

describe('relations', () => {
  const relationFields = [
    ...fields,
    {
      ...field('operation:task', 'account', 'relation'),
      _id: 'rel-source',
      relation: {
        targetRecordType: 'core:company',
        kind: 'manyToOne' as const,
        side: 'source' as const,
        inverseFieldId: 'rel-inverse',
      },
    },
    {
      ...field('core:company', 'tasks', 'relation'),
      _id: 'rel-inverse',
      relation: {
        targetRecordType: 'operation:task',
        kind: 'manyToOne' as const,
        side: 'inverse' as const,
        inverseFieldId: 'rel-source',
      },
    },
  ];

  const build = () => {
    const { owners, calls } = createOwners();
    const loadCompanies = owners.load;

    owners.load = async (context, descriptor, ids) =>
      descriptor.recordType === 'operation:task'
        ? ids.map((id) =>
            id === task._id
              ? task
              : id === 'task-2'
              ? { ...task, _id: id }
              : null,
          )
        : loadCompanies(context, descriptor, ids);

    return {
      schema: buildTenantSchema({
        version: 3,
        recordTypes: DATA_EXTENSION_RECORD_TYPES,
        fields: relationFields,
        owners,
      }),
      calls,
    };
  };

  it('exposes both sides as typed object fields', () => {
    const { schema } = build();
    const taskValues = schema.getType('OperationTaskDataExtensions');
    const companyValues = schema.getType('CompanyDataExtensions');
    const taskPatch = schema.getType('OperationTaskDataExtensionsPatch');
    const companyPatch = schema.getType('CompanyDataExtensionsPatch');

    expect(printSchema(schema)).toContain('account: Company');
    expect(
      String((companyValues as GraphQLObjectType).getFields().tasks.type),
    ).toBe('[OperationTask!]!');
    expect(
      (companyValues as GraphQLObjectType)
        .getFields()
        .tasks.args.map((arg) => arg.name),
    ).toEqual(['limit']);
    expect(
      String((taskValues as GraphQLObjectType).getFields().account.type),
    ).toBe('Company');
    expect(
      String((taskPatch as GraphQLInputObjectType).getFields().account.type),
    ).toBe('ID');
    // The virtual side is writable as the full list of linking records.
    expect(
      String((companyPatch as GraphQLInputObjectType).getFields().tasks.type),
    ).toBe('[ID!]');
  });

  it('writes the virtual side onto the linking records', async () => {
    const { schema, calls } = build();
    const { context, checked } = createContext();
    const result = await execute({
      schema,
      document: parse(`mutation {
        companyDataExtensionsPatch(_id: "company-1", values: { tasks: ["task-2"] }) { _id }
      }`),
      contextValue: context,
    });

    expect(result.errors).toBeUndefined();
    expect(checked).toEqual(
      expect.arrayContaining(['contactsUpdate', 'taskRead', 'taskUpdate']),
    );
    // No own values, so the company itself is not patched.
    expect(calls.some((call) => call.method === 'patch')).toBe(false);
    expect(calls.filter((call) => call.method === 'link')).toEqual([
      {
        method: 'link',
        args: ['operation:task', 'account', [task._id], 'company-1', 'remove'],
      },
      {
        method: 'link',
        args: ['operation:task', 'account', ['task-2'], 'company-1', 'add'],
      },
    ]);
  });

  it('needs update rights on the linking type to write the virtual side', async () => {
    const { schema, calls } = build();
    const { context } = createContext(['taskUpdate']);
    const result = await execute({
      schema,
      document: parse(`mutation {
        companyDataExtensionsPatch(_id: "company-1", values: { tasks: null }) { _id }
      }`),
      contextValue: context,
    });

    expect(result.errors?.[0].message).toBe('Permission required');
    expect(calls.some((call) => call.method === 'link')).toBe(false);
  });

  it('resolves the link forwards and backwards with target permissions', async () => {
    const { schema, calls } = build();
    const { context, checked } = createContext();
    const result = await execute({
      schema,
      document: parse(`{
        operationTask(_id: "${task._id}") {
          name
          dataExtensions { account { _id primaryName } }
        }
        company(_id: "company-1") {
          dataExtensions { tasks(limit: 5) { _id name } }
        }
      }`),
      contextValue: context,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      operationTask: {
        name: 'Prepare inspection',
        dataExtensions: { account: { _id: 'company-1', primaryName: 'Acme' } },
      },
      company: {
        dataExtensions: {
          tasks: [{ _id: task._id, name: 'Prepare inspection' }],
        },
      },
    });
    expect(checked).toEqual(
      expect.arrayContaining(['taskRead', 'contactsRead']),
    );
    expect(calls).toContainEqual({
      method: 'findByRelation',
      args: ['operation:task', 'account', 'company-1', 5],
    });
  });

  it('searches records by name with the read permission', async () => {
    const { schema, calls } = build();
    const { context, checked } = createContext();
    const result = await execute({
      schema,
      document: parse(
        `{ companySearch(searchValue: "ac", limit: 5) { _id primaryName } }`,
      ),
      contextValue: context,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      companySearch: [{ _id: 'company-1', primaryName: 'Acme' }],
    });
    expect(checked).toContain('contactsRead');
    expect(calls).toContainEqual({
      method: 'search',
      args: ['core:company', 'ac', 5],
    });
  });

  it('refuses to link a record that does not exist', async () => {
    const { schema, calls } = build();
    const { context } = createContext();
    const result = await execute({
      schema,
      document: parse(`mutation {
        operationTaskDataExtensionsPatch(_id: "${task._id}", values: { account: "missing" }) { _id }
      }`),
      contextValue: context,
    });

    expect(result.errors?.[0].message).toContain('no Companies found');
    expect(calls.some((call) => call.method === 'patch')).toBe(false);
  });
});

describe('query limits', () => {
  const { owners } = createOwners();
  const schema = buildTenantSchema({
    version: 1,
    recordTypes: DATA_EXTENSION_RECORD_TYPES,
    fields,
    owners,
  });
  const check = (source: string) =>
    validate(schema, parse(source), [
      ...specifiedRules,
      maxDepthRule,
      maxAliasesRule,
    ]).map((error) => error.message);

  it('rejects too many aliases', () => {
    const aliases = Array.from(
      { length: 31 },
      (_, index) => `a${index}: company(_id: "x") { _id }`,
    ).join(' ');

    expect(check(`{ ${aliases} }`)).toEqual(
      expect.arrayContaining(['At most 30 aliases']),
    );
  });

  it('accepts ordinary documents', () => {
    expect(
      check('{ company(_id: "x") { _id dataExtensions { tier } } }'),
    ).toEqual([]);
  });
});

describe('composite field types', () => {
  const compositeFields: IDataExtensionField[] = [
    field('core:company', 'contractValue', 'currency'),
    field('core:company', 'office', 'address'),
    field('core:company', 'websites', 'links'),
    field('core:company', 'attachments', 'files'),
    field('core:company', 'meta', 'json'),
    field('core:company', 'stars', 'rating'),
    { ...field('core:company', 'accountManager', 'member') },
    {
      ...field('core:company', 'supportTeam', 'member'),
      settings: { multiple: true },
    },
  ];

  const companyWithValues: IDataExtensionRecord = {
    _id: 'company-1',
    native: { primaryName: 'Acme' },
    dataExtensions: {
      contractValue: { amount: 1200, currency: 'MNT' },
      office: { city: 'Ulaanbaatar' },
      websites: [{ url: 'https://acme.mn', label: 'Site' }],
      attachments: [{ url: '1700-a.pdf', name: 'a.pdf', size: 10 }],
      meta: { source: 'import', tags: ['x'] },
      stars: 4,
      accountManager: 'user-1',
      supportTeam: ['user-1', 'user-2'],
    },
  };

  const build = () => {
    const loads: [string, string[]][] = [];
    const owners: IOwnerResolvers = {
      async load(_context, descriptor, ids) {
        loads.push([descriptor.recordType, ids]);

        if (descriptor.recordType === 'core:teamMember') {
          return ids.map((id) => ({
            _id: id,
            native: { fullName: `Member ${id}` },
            dataExtensions: {},
          }));
        }

        return ids.map(() => companyWithValues);
      },
      patch: async () => companyWithValues,
      findByRelation: async () => [],
      search: async () => [],
      link: async (_context, _descriptor, _key, ids) => ids,
    };

    return {
      schema: buildTenantSchema({
        version: 8,
        recordTypes: DATA_EXTENSION_RECORD_TYPES,
        fields: compositeFields,
        owners,
      }),
      loads,
    };
  };

  it('generates object, list, JSON and member types', () => {
    const sdl = printSchema(build().schema);

    expect(sdl).toContain('contractValue: DataExtensionCurrency');
    expect(sdl).toContain('office: DataExtensionAddress');
    expect(sdl).toContain('websites: [DataExtensionLink!]');
    expect(sdl).toContain('attachments: [DataExtensionFile!]');
    expect(sdl).toContain('meta: JSON');
    expect(sdl).toContain('stars: Int');
    expect(sdl).toContain('accountManager: TeamMember');
    expect(sdl).toContain('supportTeam: [TeamMember!]!');
    expect(sdl).toContain('contractValue: DataExtensionCurrencyInput');
    expect(sdl).toContain('accountManager: ID');
    expect(sdl).toContain('supportTeam: [ID!]');
  });

  it('resolves composite values and team members', async () => {
    const { schema, loads } = build();
    const { context, checked } = createContext();
    const result = await execute({
      schema,
      document: parse(`{
        company(_id: "company-1") {
          dataExtensions {
            contractValue { amount currency }
            office { city country }
            websites { url label }
            meta
            stars
            accountManager { _id fullName }
            supportTeam { _id }
          }
        }
      }`),
      contextValue: context,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.company).toEqual({
      dataExtensions: {
        contractValue: { amount: 1200, currency: 'MNT' },
        office: { city: 'Ulaanbaatar', country: null },
        websites: [{ url: 'https://acme.mn', label: 'Site' }],
        meta: { source: 'import', tags: ['x'] },
        stars: 4,
        accountManager: { _id: 'user-1', fullName: 'Member user-1' },
        supportTeam: [{ _id: 'user-1' }, { _id: 'user-2' }],
      },
    });
    expect(checked).toContain('teamMembersRead');
    expect(loads).toContainEqual(['core:teamMember', ['user-1']]);
  });

  it('refuses a patch naming a team member that does not exist', async () => {
    const owners: IOwnerResolvers = {
      load: async (_context, descriptor, ids) =>
        descriptor.recordType === 'core:teamMember'
          ? ids.map(() => null)
          : ids.map(() => companyWithValues),
      patch: async () => companyWithValues,
      findByRelation: async () => [],
      search: async () => [],
      link: async (_context, _descriptor, _key, ids) => ids,
    };
    const schema = buildTenantSchema({
      version: 8,
      recordTypes: DATA_EXTENSION_RECORD_TYPES,
      fields: compositeFields,
      owners,
    });
    const { context } = createContext();
    const result = await execute({
      schema,
      document: parse(`mutation {
        companyDataExtensionsPatch(_id: "company-1", values: { accountManager: "ghost" }) { _id }
      }`),
      contextValue: context,
    });

    expect(result.errors?.[0].message).toContain('no team member for every id');
  });
});
