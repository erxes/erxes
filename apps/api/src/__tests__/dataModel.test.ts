import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const PROJECT = { key: 'project', singularLabel: 'Project', pluralLabel: 'Projects' };

describe('Data Extensions: objects and fields', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('adds a custom object with a name field, listed as a record type of its own', async () => {
    const owner = t.owner();
    const object = await owner.dataObjects.create({ ...PROJECT, icon: 'IconBriefcase' });

    expect(object).toMatchObject({
      key: 'project',
      recordType: 'custom.project',
      status: 'active',
    });

    const { data: fields } = await owner.dataFields.list({ recordType: 'custom.project' });

    expect(fields.map((field) => [field.key, field.type])).toEqual([['name', 'text']]);
    expect(object.labelFieldId).toBe(fields[0]?.id);

    const { data: types } = await t.member().recordTypes.list({});

    expect(types.at(-1)).toMatchObject({
      type: 'custom.project',
      label: 'Projects',
      permission: 'objects.view',
      updatePermission: 'objects.edit',
    });
  });

  it('keeps keys unique, and an organisation’s objects its own', async () => {
    await expect(t.owner().dataObjects.create(PROJECT)).rejects.toMatchObject({
      status: 409,
      code: 'TAKEN',
      data: { field: 'key' },
    });

    const { data } = await t.other().dataObjects.list({});

    expect(data).toEqual([]);
    await expect(t.other().dataObjects.get({ key: 'project' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    // Its own object of the same key is another table, in its own schema.
    await expect(t.other().dataObjects.create(PROJECT)).resolves.toMatchObject({ key: 'project' });
  });

  it('needs properties.manage to change the data model', async () => {
    await expect(t.member().dataObjects.create({ ...PROJECT, key: 'deal' })).rejects.toMatchObject({
      status: 403,
    });
    await expect(
      t.member().dataFields.create({
        recordType: 'core.customer',
        key: 'tier',
        label: 'Tier',
        type: 'text',
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('adds fields to core’s record types, checking each definition', async () => {
    const owner = t.owner();

    const tier = await owner.dataFields.create({
      recordType: 'core.customer',
      key: 'tier',
      label: 'Tier',
      type: 'select',
      options: [
        { value: 'gold', label: 'Gold', color: 'yellow' },
        { value: 'silver', label: 'Silver', color: 'gray' },
      ],
    });

    expect(tier).toMatchObject({ key: 'tier', type: 'select', position: 0, status: 'active' });

    await expect(
      owner.dataFields.create({
        recordType: 'core.customer',
        key: 'size',
        label: 'Size',
        type: 'select',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    await expect(
      owner.dataFields.create({
        recordType: 'core.customer',
        key: 'done',
        label: 'Done',
        type: 'boolean',
        settings: { unique: true },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    await expect(
      owner.dataFields.create({
        recordType: 'core.customer',
        key: 'tier',
        label: 'Again',
        type: 'text',
      }),
    ).rejects.toMatchObject({ code: 'TAKEN', data: { field: 'key' } });
    await expect(
      owner.dataFields.create({
        recordType: 'sales.deal',
        key: 'stage',
        label: 'Stage',
        type: 'text',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_REFERENCE', data: { field: 'recordType' } });
  });

  it('changes a field within what its column takes', async () => {
    const owner = t.owner();

    const note = await owner.dataFields.create({
      recordType: 'core.company',
      key: 'note',
      label: 'Note',
      type: 'text',
    });

    await expect(
      owner.dataFields.update({ id: note.id, key: 'summary', type: 'longText', label: 'Summary' }),
    ).resolves.toMatchObject({ key: 'summary', type: 'longText', label: 'Summary' });
    await expect(owner.dataFields.update({ id: note.id, type: 'number' })).rejects.toMatchObject({
      code: 'INVALID_TYPE',
    });
  });

  it('orders, archives, restores and drops fields; drops only archived ones', async () => {
    const owner = t.owner();

    const make = (key: string) =>
      owner.dataFields.create({ recordType: 'core.product', key, label: key, type: 'number' });

    const weight = await make('weight');
    const height = await make('height');

    const { data: ordered } = await owner.dataFields.reorder({
      recordType: 'core.product',
      ids: [height.id, weight.id],
    });

    expect(ordered.map((field) => field.key)).toEqual(['height', 'weight']);
    await expect(owner.dataFields.remove({ id: weight.id })).rejects.toMatchObject({
      status: 409,
      code: 'ARCHIVE_FIRST',
    });

    await owner.dataFields.archive({ id: weight.id });

    const { data: active } = await owner.dataFields.list({ recordType: 'core.product' });

    const { data: archived } = await owner.dataFields.list({
      recordType: 'core.product',
      archived: true,
    });

    expect(active.map((field) => field.key)).toEqual(['height']);
    expect(archived.map((field) => field.key)).toEqual(['weight']);

    await owner.dataFields.restore({ id: weight.id });
    await owner.dataFields.archive({ id: weight.id });
    await expect(owner.dataFields.remove({ id: weight.id })).resolves.toEqual({ id: weight.id });
    // The key and its column are free again.
    await expect(make('weight')).resolves.toMatchObject({ key: 'weight' });
  });

  it('lets a plugin read the fields of its own record types only', async () => {
    const hr = t.hr();

    await expect(hr.dataFields.list({ recordType: 'core.customer' })).rejects.toMatchObject({
      status: 403,
    });
  });

  it('drops an archived object with its table, fields and the relations to it', async () => {
    const owner = t.owner();

    await owner.dataObjects.create({ ...PROJECT, key: 'ticket', singularLabel: 'Ticket' });
    await owner.dataFields.relate({
      recordType: 'core.customer',
      key: 'tickets',
      label: 'Tickets',
      targetRecordType: 'custom.ticket',
      kind: 'oneToMany',
      inverseKey: 'customer',
      inverseLabel: 'Customer',
    });
    await expect(owner.dataObjects.remove({ key: 'ticket' })).rejects.toMatchObject({
      code: 'ARCHIVE_FIRST',
    });

    await owner.dataObjects.archive({ key: 'ticket' });
    await expect(owner.dataObjects.remove({ key: 'ticket' })).resolves.toEqual({ key: 'ticket' });

    const { data } = await owner.dataFields.list({ recordType: 'core.customer' });

    expect(data.map((field) => field.key)).not.toContain('tickets');
    await expect(owner.dataObjects.get({ key: 'ticket' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});
