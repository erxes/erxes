import { recordField, recordSetup } from './recordFixtures';

describe('custom record runtime', () => {
  it('rejects prototype keys and oversized records before emitting changes', async () => {
    const { records, emit } = recordSetup([recordField({ type: 'list' })]);
    await expect(
      records.create(
        'model-a',
        {
          propertiesData: JSON.parse('{"__proto__":{"polluted":true}}'),
        },
        'actor',
      ),
    ).rejects.toThrow();
    await expect(
      records.create(
        'model-a',
        {
          propertiesData: { title: Array(100).fill('x'.repeat(10000)) },
        },
        'actor',
      ),
    ).rejects.toThrow('512 KiB');
    expect(emit).not.toHaveBeenCalled();
  });
  it('stamps identity/audit values and emits only after successful creation', async () => {
    const { records, fields, emit } = recordSetup();
    const record = await records.create(
      'model-a',
      { propertiesData: { title: 'Building' } },
      'actor',
    );
    expect(record).toMatchObject({
      dataModelId: 'model-a',
      version: 1,
      createdBy: 'actor',
      updatedBy: 'actor',
      deletedAt: null,
      deletedBy: null,
      propertiesData: { title: 'Building' },
    });
    expect(record.createdAt).toBeInstanceOf(Date);
    expect(fields.list).toHaveBeenCalledWith('model-a');
    expect(fields.validate).toHaveBeenCalledWith('title', 'Building');
    expect(emit).toHaveBeenCalledWith('model-a', {
      action: 'create',
      current: record,
    });
    expect(await records.get('model-a', record._id)).toEqual(record);
  });

  it('preserves false and zero, and casts using the existing Properties rules', async () => {
    const { records, fields } = recordSetup([
      recordField({ _id: 'amount', type: 'number', isRequired: true }),
      recordField({
        _id: 'enabled',
        type: 'boolean',
        validations: { required: true },
      }),
      recordField({ _id: 'date', type: 'date' }),
    ]);
    const record = await records.create(
      'model-a',
      {
        propertiesData: {
          amount: 0,
          enabled: false,
          date: '2026-10-22',
        },
      },
      'actor',
    );
    expect(record.propertiesData).toEqual({
      amount: 0,
      enabled: false,
      date: new Date('2026-10-22'),
    });
    expect(fields.validate).toHaveBeenCalledWith('amount', 0);
    expect(fields.validate).toHaveBeenCalledWith('enabled', false);
    expect(fields.validate).toHaveBeenCalledWith('date', '2026-10-22');
  });

  it.each([{ isRequired: true }, { validations: { required: true } }])(
    'enforces required fields even when completely omitted: %j',
    async (settings) => {
      const { records, emit } = recordSetup([recordField(settings)]);
      await expect(
        records.create('model-a', { propertiesData: {} }, 'actor'),
      ).rejects.toThrow('Title: required');
      expect(emit).not.toHaveBeenCalled();
    },
  );

  it.each([null, '', ' ', []])(
    'rejects empty required values %j',
    async (value) => {
      const { records } = recordSetup([recordField({ isRequired: true })]);
      await expect(
        records.create(
          'model-a',
          { propertiesData: { title: value } },
          'actor',
        ),
      ).rejects.toThrow();
    },
  );

  it.each([
    { title: { $ne: null } },
    { title: 3 },
    { title: ['a'] },
    { otherModelField: 'x' },
    { 'propertiesData.title': 'x' },
  ])('rejects unsafe or foreign values %j', async (propertiesData) => {
    const { records, emit } = recordSetup();
    await expect(
      records.create('model-a', { propertiesData }, 'actor'),
    ).rejects.toThrow();
    expect(emit).not.toHaveBeenCalled();
  });

  it.each([
    { _id: 'victim' },
    { createdBy: 'other' },
    { dataModelId: 'model-b' },
    { version: 99 },
    { deletedAt: '2026-01-01' },
  ])('refuses system-field mass assignment %j', async (extra) => {
    const { records } = recordSetup();
    await expect(
      records.create('model-a', { propertiesData: {}, ...extra }, 'actor'),
    ).rejects.toThrow();
  });

  it.each([
    { archivedAt: new Date() },
    { owned: true },
    { repeating: true },
    { groupAvailable: false },
    { type: 'relation' },
    { type: 'file' },
    { type: 'editor' },
    { type: 'objectList' },
  ])('refuses unavailable/unimplemented field writes %j', async (settings) => {
    const { records, emit } = recordSetup([recordField(settings)]);
    await expect(
      records.create('model-a', { propertiesData: { title: 'x' } }, 'actor'),
    ).rejects.toThrow();
    expect(emit).not.toHaveBeenCalled();
  });

  it('rejects retired option values and normalizes choice families', async () => {
    const options = [
      { label: 'Active', value: 'active' },
      { label: 'Old', value: 'old', deprecated: true },
    ];
    const { records } = recordSetup([
      recordField({ _id: 'state', type: 'radio', options }),
      recordField({ _id: 'states', type: 'check', options }),
    ]);
    await expect(
      records.create('model-a', { propertiesData: { state: 'old' } }, 'actor'),
    ).rejects.toThrow('not an option');
    const record = await records.create(
      'model-a',
      {
        propertiesData: { state: 'active', states: ['active'] },
      },
      'actor',
    );
    expect(record.propertiesData).toEqual({
      state: 'active',
      states: ['active'],
    });
  });

  it('propagates existing validation failures without persisting or emitting', async () => {
    const { records, fields, emit, store } = recordSetup();
    fields.validate.mockRejectedValue(new Error('Title: Invalid email'));
    await expect(
      records.create(
        'model-a',
        { propertiesData: { title: 'invalid' } },
        'actor',
      ),
    ).rejects.toThrow('Invalid email');
    expect(store('model-a').records.size).toBe(0);
    expect(emit).not.toHaveBeenCalled();
  });

  it('updates as a patch without dropping other or archived values', async () => {
    const { records, store, fields } = recordSetup([
      recordField(),
      recordField({ _id: 'notes' }),
    ]);
    const record = await records.create(
      'model-a',
      {
        propertiesData: { title: 'Old', notes: 'Keep' },
      },
      'creator',
    );
    store('model-a').records.set(record._id, {
      ...record,
      propertiesData: { ...record.propertiesData, archivedField: 'Historical' },
    });
    fields.list.mockResolvedValue([
      recordField(),
      recordField({ _id: 'notes' }),
    ]);
    const updated = await records.update(
      'model-a',
      record._id,
      { propertiesData: { title: 'New' } },
      1,
      'editor',
    );
    expect(updated).toMatchObject({
      version: 2,
      createdBy: 'creator',
      updatedBy: 'editor',
      propertiesData: {
        title: 'New',
        notes: 'Keep',
        archivedField: 'Historical',
      },
    });
    const cleared = await records.update(
      'model-a',
      record._id,
      { propertiesData: { notes: null } },
      2,
      'editor',
    );
    expect(cleared.propertiesData).toEqual({
      title: 'New',
      archivedField: 'Historical',
    });
    await expect(
      records.update(
        'model-a',
        record._id,
        { propertiesData: {} },
        3,
        'editor',
      ),
    ).rejects.toThrow('At least one');
  });

  it('soft-deletes and restores the same record with its values and history', async () => {
    const { records, emit } = recordSetup();
    const record = await records.create(
      'model-a',
      { propertiesData: { title: 'Asset' } },
      'creator',
    );
    const removed = await records.remove('model-a', record._id, 1, 'remover');
    expect(removed).toMatchObject({
      version: 2,
      deletedBy: 'remover',
      propertiesData: record.propertiesData,
    });
    expect(removed.deletedAt).toBeInstanceOf(Date);
    expect((await records.list('model-a')).totalCount).toBe(0);
    expect((await records.list('model-a', { deleted: true })).list).toEqual([
      removed,
    ]);
    await expect(records.get('model-a', record._id)).rejects.toThrow(
      'not found',
    );
    const restored = await records.restore(
      'model-a',
      record._id,
      2,
      'restorer',
    );
    expect(restored).toMatchObject({
      _id: record._id,
      version: 3,
      createdBy: 'creator',
      deletedAt: null,
      deletedBy: null,
      updatedBy: 'restorer',
    });
    expect(emit.mock.calls.map(([, event]) => event.action)).toEqual([
      'create',
      'delete',
      'update',
    ]);
  });

  it('requires current required fields on restore, and allows supplying them', async () => {
    const { records, fields } = recordSetup();
    const record = await records.create(
      'model-a',
      { propertiesData: {} },
      'actor',
    );
    await records.remove('model-a', record._id, 1, 'actor');
    fields.list.mockResolvedValue([recordField({ isRequired: true })]);
    await expect(
      records.restore('model-a', record._id, 2, 'actor'),
    ).rejects.toThrow('required');
    const restored = await records.restore('model-a', record._id, 2, 'actor', {
      propertiesData: { title: 'Filled on restore' },
    });
    expect(restored.propertiesData.title).toBe('Filled on restore');
  });

  it('fences stale and concurrent updates/deletes without duplicate events', async () => {
    const { records, emit } = recordSetup();
    const record = await records.create(
      'model-a',
      { propertiesData: { title: 'A' } },
      'actor',
    );
    const results = await Promise.allSettled([
      records.update(
        'model-a',
        record._id,
        { propertiesData: { title: 'B' } },
        1,
        'actor',
      ),
      records.remove('model-a', record._id, 1, 'actor'),
    ]);
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(
      results.filter((result) => result.status === 'rejected'),
    ).toHaveLength(1);
    expect(emit).toHaveBeenCalledTimes(2);
    await expect(
      records.update(
        'model-a',
        record._id,
        { propertiesData: { title: 'C' } },
        1,
        'actor',
      ),
    ).rejects.toThrow();
    expect(emit).toHaveBeenCalledTimes(2);
  });

  it('isolates stores by model and tenant, even when a record ID is known', async () => {
    const first = recordSetup();
    const second = recordSetup();
    first.models.set('model-b', {
      ...first.model,
      _id: 'model-b',
      contentType: 'core:dataModel_model-b',
    });
    const record = await first.records.create(
      'model-a',
      { propertiesData: {} },
      'actor',
    );
    await expect(first.records.get('model-b', record._id)).rejects.toThrow(
      'not found',
    );
    await expect(
      first.records.remove('model-b', record._id, 1, 'actor'),
    ).rejects.toThrow('not found');
    await expect(second.records.get('model-a', record._id)).rejects.toThrow(
      'not found',
    );
  });

  it('rejects archived and built-in models before opening record storage', async () => {
    const { records, model, store } = recordSetup();
    await expect(
      records.create('core:company', { propertiesData: {} }, 'actor'),
    ).rejects.toThrow('existing business API');
    model.archivedAt = new Date();
    await expect(records.list('model-a')).rejects.toThrow(
      'Restore the data model',
    );
    expect(store).not.toHaveBeenCalled();
  });

  it('passes bounded metadata-derived queries to the record store', async () => {
    const { records, store } = recordSetup();
    const list = jest.spyOn(store('model-a'), 'list');
    const count = jest.spyOn(store('model-a'), 'count');
    await records.list('model-a', {
      limit: 10,
      offset: 20,
      filters: [{ fieldId: 'title', operator: 'EQ', value: 'Asset' }],
    });
    expect(list).toHaveBeenCalledWith({
      filter: { $and: [{ 'propertiesData.title': { $eq: 'Asset' } }] },
      limit: 10,
      offset: 20,
      deleted: false,
      sort: { createdAt: -1, _id: -1 },
    });
    expect(count).toHaveBeenCalledWith(list.mock.calls[0][0]);
  });
});
