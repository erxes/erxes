import { properties } from '~/meta/properties';
import { getBuiltinDataModels } from '../builtins';
import { DataModelRegistry } from '../registry';
import type {
  DataModelDefinitionChanges,
  IDataModelDefinition,
  IDataModelDefinitionStore,
  IDataModelListParams,
} from '../types';

class MemoryDefinitionStore implements IDataModelDefinitionStore {
  readonly definitions = new Map<string, IDataModelDefinition>();
  readonly fields = new Map<string, { _id: string; type: string }[]>();
  async builtinOverrides(): Promise<IDataModelDefinition[]> {
    return [...this.definitions.values()].filter(
      (definition) => definition.source === 'BUILTIN',
    );
  }
  async identityFields(
    modelId: string,
  ): Promise<{ _id: string; type: string }[]> {
    return this.fields.get(modelId) ?? [];
  }

  async list({
    archived,
    limit,
    offset,
  }: IDataModelListParams): Promise<IDataModelDefinition[]> {
    return [...this.definitions.values()]
      .filter(
        (definition) =>
          definition.source !== 'BUILTIN' &&
          Boolean(definition.archivedAt) === archived,
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(offset, offset + limit);
  }

  async count(archived: boolean): Promise<number> {
    return [...this.definitions.values()].filter(
      (definition) =>
        definition.source !== 'BUILTIN' &&
        Boolean(definition.archivedAt) === archived,
    ).length;
  }

  async findById(id: string): Promise<IDataModelDefinition | null> {
    return this.definitions.get(id) ?? null;
  }

  async insert(
    definition: IDataModelDefinition,
  ): Promise<IDataModelDefinition> {
    if (
      [...this.definitions.values()].some(
        ({ name }) => name === definition.name,
      )
    ) {
      throw Object.assign(new Error('Duplicate key'), { code: 11000 });
    }
    this.definitions.set(definition._id, definition);
    return definition;
  }

  async update(
    id: string,
    expectedVersion: number,
    changes: DataModelDefinitionChanges,
  ): Promise<IDataModelDefinition | null> {
    const definition = this.definitions.get(id);
    if (!definition || definition.version !== expectedVersion) return null;
    const updated = { ...definition, ...changes, version: expectedVersion + 1 };
    this.definitions.set(id, updated);
    return updated;
  }
}

const input = {
  name: 'contract',
  labelSingular: 'Contract',
  labelPlural: 'Contracts',
};

const setup = () => {
  const store = new MemoryDefinitionStore();
  return { store, registry: new DataModelRegistry(store) };
};

describe('data model registry', () => {
  it('derives built-in identities and fields from existing core property metadata', async () => {
    const { registry, store } = setup();
    const result = await registry.list();
    expect(result.totalCount).toBe(properties.types.length);
    expect(result.list.map((model) => model.contentType)).toEqual(
      properties.types.map((type) => `core:${type.type}`),
    );
    expect((await registry.get('core:company')).systemFields).toEqual(
      properties.types
        .find((type) => type.type === 'company')
        ?.systemFields?.map(({ code, name, type }) => ({ code, name, type })),
    );
    expect(store.definitions.size).toBe(0);
  });

  it('does not expose mutable shared built-in metadata', async () => {
    const { registry } = setup();
    const company = await registry.get('core:company');
    company.systemFields[0].name = 'Changed';
    expect((await registry.get('core:company')).systemFields[0].name).toBe(
      'Logo',
    );
  });

  it.each(getBuiltinDataModels().map((model) => model._id))(
    'protects the identity and lifecycle of %s while allowing display settings',
    async (id) => {
      const { registry, store } = setup();
      const builtin = await registry.get(id);
      const updated = await registry.update(
        id,
        { labelSingular: 'Changed', icon: 'IconBuilding' },
        1,
        'admin',
      );
      expect(updated).toMatchObject({
        ...builtin,
        labelSingular: 'Changed',
        icon: 'IconBuilding',
        version: 2,
        updatedBy: 'admin',
        updatedAt: expect.any(Date),
      });
      expect(updated.updatedAt).toBeInstanceOf(Date);
      expect((await registry.get(id)).labelSingular).toBe('Changed');
      expect(
        (await registry.list()).list.find((model) => model._id === id)
          ?.labelSingular,
      ).toBe('Changed');
      expect((await registry.list()).totalCount).toBe(
        getBuiltinDataModels().length,
      );
      expect((await registry.list({ archived: true })).totalCount).toBe(0);
      await expect(
        registry.update(id, { name: 'changed' }, 2, 'admin'),
      ).rejects.toThrow();
      await expect(
        registry.update(id, { source: 'CUSTOM' }, 2, 'admin'),
      ).rejects.toThrow();
      await expect(
        registry.update(id, { labelSingular: 'Stale' }, 1, 'admin'),
      ).rejects.toThrow('reload');
      await expect(registry.archive(id, 1, 'admin')).rejects.toThrow(
        'Built-in models cannot be changed',
      );
      await expect(registry.restore(id, 1, 'admin')).rejects.toThrow(
        'Built-in models cannot be changed',
      );
      expect(store.definitions.get(id)?.source).toBe('BUILTIN');
    },
  );

  it.each([
    'customer',
    'customers',
    'company',
    'companies',
    'product',
    'user',
    'users',
  ])('reserves built-in name %s', async (name) => {
    const { registry, store } = setup();
    await expect(registry.create({ ...input, name }, 'admin')).rejects.toThrow(
      'reserved',
    );
    expect(store.definitions.size).toBe(0);
  });

  it('creates tenant-owned definitions with server-owned identity and audit fields', async () => {
    const { registry } = setup();
    const model = await registry.create(
      { ...input, labelSingular: ' Contract ' },
      'admin',
    );
    expect(model).toMatchObject({
      ...input,
      description: '',
      icon: 'IconDatabase',
      source: 'CUSTOM',
      version: 1,
      createdBy: 'admin',
      updatedBy: 'admin',
      archivedAt: null,
    });
    expect(model.contentType).toBe(`core:dataModel_${model._id}`);
    expect(model.createdAt).toBeInstanceOf(Date);
    expect(model.systemFields.map((field) => field.code)).toEqual([
      '_id',
      'createdAt',
      'updatedAt',
      'createdBy',
      'updatedBy',
      'version',
      'deletedAt',
      'deletedBy',
    ]);
    expect(await registry.get(model._id)).toEqual(model);
  });

  it.each([
    { source: 'BUILTIN' },
    { _id: 'core:company' },
    { createdBy: 'someone' },
    { contentType: 'core:company' },
    { version: 7 },
    { systemFields: [] },
    { collectionName: 'companies' },
  ])('rejects injected server-owned settings %j', async (extra) => {
    const { registry, store } = setup();
    await expect(
      registry.create({ ...input, ...extra }, 'admin'),
    ).rejects.toThrow();
    expect(store.definitions.size).toBe(0);
  });

  it.each([
    '',
    'Contract',
    '$where',
    'a.b',
    '__proto__',
    'a/b',
    'a'.repeat(64),
  ])('rejects unsafe model name %s', async (name) => {
    const { registry } = setup();
    await expect(
      registry.create({ ...input, name }, 'admin'),
    ).rejects.toThrow();
  });

  it('allows ordinary names that happen to match object prototype properties', async () => {
    const { registry } = setup();
    expect(
      (await registry.create({ ...input, name: 'constructor' }, 'admin')).name,
    ).toBe('constructor');
  });

  it.each([
    { labelSingular: ' ' },
    { labelPlural: '' },
    { description: 'a'.repeat(2001) },
    { icon: '../icon.svg' },
    { icon: null },
  ])('validates presentation settings %j', async (extra) => {
    const { registry } = setup();
    await expect(
      registry.create({ ...input, ...extra }, 'admin'),
    ).rejects.toThrow();
  });

  it('rejects duplicate names, including archived model names', async () => {
    const { registry } = setup();
    const model = await registry.create(input, 'admin');
    await expect(registry.create(input, 'admin')).rejects.toThrow(
      'already exists',
    );
    await registry.archive(model._id, 1, 'admin');
    await expect(registry.create(input, 'admin')).rejects.toThrow(
      'already exists',
    );
  });

  it('keeps model identity stable when display labels change', async () => {
    const { registry } = setup();
    const model = await registry.create(input, 'admin');
    const updated = await registry.update(
      model._id,
      { labelSingular: 'Agreement' },
      1,
      'editor',
    );
    expect(updated).toMatchObject({
      _id: model._id,
      name: model.name,
      contentType: model.contentType,
      labelSingular: 'Agreement',
      version: 2,
      createdBy: 'admin',
      updatedBy: 'editor',
    });
    await expect(
      registry.update(model._id, { name: 'agreement' }, 2, 'admin'),
    ).rejects.toThrow();
    await expect(
      registry.update(model._id, { systemFields: [] }, 2, 'admin'),
    ).rejects.toThrow();
    await expect(registry.update(model._id, {}, 2, 'admin')).rejects.toThrow();
  });

  it('archives without deleting metadata and restores the same identity', async () => {
    const { registry, store } = setup();
    const model = await registry.create(input, 'admin');
    const archived = await registry.archive(model._id, 1, 'archiver');
    expect(archived.archivedAt).toBeInstanceOf(Date);
    expect(archived.archivedBy).toBe('archiver');
    expect(
      (await registry.list()).list.some(({ _id }) => _id === model._id),
    ).toBe(false);
    expect((await registry.list({ archived: true })).list).toEqual([archived]);
    expect(store.definitions.size).toBe(1);
    await expect(
      registry.update(model._id, { labelSingular: 'Hidden' }, 2, 'admin'),
    ).rejects.toThrow('Restore the model');
    await expect(registry.archive(model._id, 2, 'admin')).rejects.toThrow(
      'already archived',
    );
    const restored = await registry.restore(model._id, 2, 'restorer');
    expect(restored).toMatchObject({
      _id: model._id,
      contentType: model.contentType,
      version: 3,
      archivedAt: null,
      archivedBy: null,
      updatedBy: 'restorer',
    });
    expect((await registry.list({ archived: true })).totalCount).toBe(0);
    await expect(registry.restore(model._id, 3, 'admin')).rejects.toThrow(
      'not archived',
    );
  });

  it('rejects stale changes and fences concurrent writes', async () => {
    const { registry } = setup();
    const model = await registry.create(input, 'admin');
    const writes = await Promise.allSettled([
      registry.update(model._id, { labelSingular: 'First' }, 1, 'first'),
      registry.archive(model._id, 1, 'second'),
    ]);
    expect(
      writes.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(
      writes.filter((result) => result.status === 'rejected'),
    ).toHaveLength(1);
    await expect(registry.archive(model._id, 1, 'admin')).rejects.toThrow(
      'reload',
    );
    expect((await registry.get(model._id)).version).toBe(2);
  });

  it('does not overwrite a definition changed between lookup and save', async () => {
    const { registry, store } = setup();
    const model = await registry.create(input, 'admin');
    jest.spyOn(store, 'update').mockResolvedValueOnce(null);
    await expect(
      registry.update(model._id, { labelSingular: 'Lost' }, 1, 'admin'),
    ).rejects.toThrow('reload');
  });

  it('keeps definitions isolated between tenant-supplied stores', async () => {
    const first = setup();
    const second = setup();
    const a = await first.registry.create(input, 'same-user');
    const b = await second.registry.create(input, 'same-user');
    expect(a._id).not.toBe(b._id);
    await expect(second.registry.get(a._id)).rejects.toThrow('not found');
    await expect(
      second.registry.archive(a._id, 1, 'same-user'),
    ).rejects.toThrow('not found');
    expect((await first.registry.get(a._id)).version).toBe(1);
  });

  it('keeps built-in presentation overrides tenant-local and fences concurrent initial saves', async () => {
    const first = setup();
    const second = setup();
    const writes = await Promise.allSettled([
      first.registry.update(
        'core:customer',
        { labelSingular: 'Person' },
        1,
        'first',
      ),
      first.registry.update(
        'core:customer',
        { labelSingular: 'Client' },
        1,
        'second',
      ),
    ]);
    expect(
      writes.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect((await first.registry.get('core:customer')).version).toBe(2);
    expect((await second.registry.get('core:customer')).version).toBe(1);
    const updated = await first.registry.update(
      'core:customer',
      { description: 'People we work with' },
      2,
      'editor',
    );
    expect(updated.version).toBe(3);
    expect(updated.labelSingular).toBe('Person');
    expect((await first.registry.list()).totalCount).toBe(
      getBuiltinDataModels().length,
    );
  });

  it('only accepts supported identity fields on the same object, including built-in fields', async () => {
    const { registry, store } = setup();
    const model = await registry.create(input, 'admin');
    store.fields.set(model._id, [
      { _id: 'title', type: 'text' },
      { _id: 'amount', type: 'number' },
    ]);
    const updated = await registry.update(
      model._id,
      { recordLabelField: 'title', recordImageField: 'title' },
      1,
      'admin',
    );
    expect(updated).toMatchObject({
      recordLabelField: 'title',
      recordImageField: 'title',
    });
    for (const recordLabelField of [
      'other-object-field',
      'amount',
      '$where',
      'propertiesData.title',
    ])
      await expect(
        registry.update(model._id, { recordLabelField }, 2, 'admin'),
      ).rejects.toThrow('active text field');
    await expect(
      registry.update(
        'core:customer',
        { recordImageField: 'firstName' },
        1,
        'admin',
      ),
    ).rejects.toThrow('image field');
    const builtin = await registry.update(
      'core:customer',
      { recordLabelField: 'primaryEmail', recordImageField: 'avatar' },
      1,
      'admin',
    );
    expect(builtin).toMatchObject({
      recordLabelField: 'primaryEmail',
      recordImageField: 'avatar',
    });
    const cleared = await registry.update(
      'core:customer',
      { recordLabelField: null, recordImageField: null },
      2,
      'admin',
    );
    expect(cleared).toMatchObject({
      recordLabelField: null,
      recordImageField: null,
    });
  });

  it('paginates across the built-in/custom boundary without duplicates', async () => {
    const { registry } = setup();
    await registry.create(input, 'admin');
    await registry.create({ ...input, name: 'asset' }, 'admin');
    const all = await registry.list();
    const pages = await Promise.all(
      all.list.map((_, offset) => registry.list({ limit: 1, offset })),
    );
    expect(pages.flatMap((page) => page.list)).toEqual(all.list);
    expect((await registry.list({ offset: all.totalCount })).list).toEqual([]);
    expect(all.list.slice(-2).map(({ name }) => name)).toEqual([
      'asset',
      'contract',
    ]);
  });

  it.each([
    { limit: 0 },
    { limit: 201 },
    { offset: -1 },
    { offset: 0.5 },
    { archived: null },
  ])('bounds catalog queries %j', async (params) => {
    const { registry } = setup();
    await expect(registry.list(params)).rejects.toThrow();
  });

  it('rejects missing actors and invalid versions without accepting changes', async () => {
    const { registry } = setup();
    await expect(registry.create(input, '')).rejects.toThrow();
    const model = await registry.create(input, 'admin');
    await expect(
      registry.update(model._id, { labelSingular: 'Changed' }, 0, 'admin'),
    ).rejects.toThrow();
    await expect(registry.archive(model._id, 1, '')).rejects.toThrow();
    expect((await registry.get(model._id)).version).toBe(1);
  });
});
