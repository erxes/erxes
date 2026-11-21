import { withSystem } from '@erxes/core-db';
import { describe, expect, it } from 'vite-plus/test';
import { sweepRemovedRecords } from '~/modules/dataExtensions/hostRecords';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('Data Extensions: converting a field’s type', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  /** Orders whose size and channel were typed as text. */
  const setUp = async () => {
    const owner = t.owner();

    await owner.dataObjects.create({ key: 'order', singularLabel: 'Order', pluralLabel: 'Orders' });

    const size = await owner.dataFields.create({
      recordType: 'custom.order',
      key: 'size',
      label: 'Size',
      type: 'text',
    });

    const channel = await owner.dataFields.create({
      recordType: 'custom.order',
      key: 'channel',
      label: 'Channel',
      type: 'text',
    });

    for (const [name, sizeValue, channelValue] of [
      ['A', '12', 'web'],
      ['B', ' 7.5 ', 'shop'],
      ['C', 'large', 'web'],
      ['D', null, null],
    ] as const) {
      await owner.dataRecords.create({
        objectKey: 'order',
        values: { name, size: sizeValue, channel: channelValue },
      });
    }

    return { size, channel };
  };

  const sizes = async () =>
    (
      await t
        .owner()
        .dataRecords.list({ objectKey: 'order', sortField: 'name', sortDirection: 'asc' })
    ).data.map((record) => record.values.size);

  it('counts what would carry over first, and keeps the values that fit', async () => {
    const { size } = await setUp();
    const owner = t.owner();

    await expect(owner.dataChanges.convert({ id: size.id, type: 'number' })).resolves.toMatchObject(
      {
        converted: 2,
        unconvertible: 1,
        samples: ['large'],
        field: null,
      },
    );
    expect(await sizes()).toEqual(['12', '7.5', 'large', null]);
    await expect(
      owner.dataChanges.convert({ id: size.id, type: 'number', apply: true }),
    ).rejects.toMatchObject({ code: 'UNCONVERTIBLE', data: { count: 1 } });
    await expect(
      t.member().dataChanges.convert({ id: size.id, type: 'number' }),
    ).rejects.toMatchObject({ status: 403 });

    const done = await owner.dataChanges.convert({
      id: size.id,
      type: 'number',
      apply: true,
      clearUnconvertible: true,
    });

    expect(done.field).toMatchObject({ key: 'size', type: 'number' });
    expect(await sizes()).toEqual([12, 7.5, null, null]);
    await expect(
      owner.dataRecords.create({ objectKey: 'order', values: { size: 'big' } }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });

  it('makes a select’s options from the values, and leaves a field a formula reads', async () => {
    const owner = t.owner();
    const { data } = await owner.dataFields.list({ recordType: 'custom.order' });
    const channel = data.find((field) => field.key === 'channel')?.id ?? '';

    await owner.dataFields.create({
      recordType: 'custom.order',
      key: 'label',
      label: 'Label',
      type: 'formula',
      settings: { formula: { expression: 'UPPER({channel})' } },
    });
    await expect(
      owner.dataChanges.convert({ id: channel, type: 'select', apply: true }),
    ).rejects.toMatchObject({ code: 'FIELD_IN_USE' });

    const label = (await owner.dataFields.list({ recordType: 'custom.order' })).data.find(
      (field) => field.key === 'label',
    );

    await owner.dataFields.archive({ id: label?.id ?? '' });
    await owner.dataFields.remove({ id: label?.id ?? '' });

    const done = await owner.dataChanges.convert({ id: channel, type: 'select', apply: true });

    expect(done.field?.options.map((option) => option.value)).toEqual(['shop', 'web']);
    expect(
      (
        await owner.dataRecords.list({
          objectKey: 'order',
          filter: '{"match":"all","rules":[{"path":"subject.channel","op":"eq","value":"web"}]}',
        })
      ).data,
    ).toHaveLength(2);
    await expect(owner.dataChanges.convert({ id: channel, type: 'select' })).rejects.toMatchObject({
      code: 'INVALID_TYPE',
    });
  });
});

describe('Data Extensions: values of merged and removed customers', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('fills the kept customer’s blanks from the merged ones, and sweeps up the purged', async () => {
    const owner = t.owner();

    for (const [key, type] of [
      ['tier', 'text'],
      ['score', 'number'],
      ['memberNo', 'text'],
    ] as const) {
      await owner.dataFields.create({
        recordType: 'core.customer',
        key,
        label: key,
        type,
        settings: key === 'memberNo' ? { unique: true } : {},
      });
    }

    const keep = await owner.customers.create({ firstName: 'Anu', primaryEmail: 'anu@mail.mn' });
    const other = await owner.customers.create({ firstName: 'Anu B', primaryEmail: 'b@mail.mn' });

    const values = (id: string) =>
      owner.dataValues.get({ recordType: 'core.customer', recordId: id });

    await owner.dataValues.update({
      recordType: 'core.customer',
      recordId: keep.id,
      values: { score: 1 },
    });
    await owner.dataValues.update({
      recordType: 'core.customer',
      recordId: other.id,
      values: { tier: 'gold', score: 5, memberNo: 'C-1' },
    });
    await owner.customers.merge({ ids: [keep.id, other.id], keepId: keep.id });

    expect((await values(keep.id)).values).toEqual({ tier: 'gold', score: 1, memberNo: 'C-1' });

    const gone = await owner.customers.create({ firstName: 'Gone', primaryEmail: 'g@mail.mn' });

    await owner.dataValues.update({
      recordType: 'core.customer',
      recordId: gone.id,
      values: { memberNo: 'C-2' },
    });
    await owner.customers.remove({ ids: [gone.id] });
    await withSystem('test', (tx) => sweepRemovedRecords(tx));

    const takeCode = () =>
      owner.dataValues.update({
        recordType: 'core.customer',
        recordId: keep.id,
        values: { memberNo: 'C-2' },
      });

    // In the recycle bin it can still come back, values and all.
    await expect(takeCode()).rejects.toMatchObject({ code: 'TAKEN' });

    const binned = (await owner.trash.list({})).data.find((item) => item.recordId === gone.id);

    await owner.trash.purge({ ids: [binned?.id ?? ''] });
    await withSystem('test', (tx) => sweepRemovedRecords(tx));

    // Purged for good: its unique code is free again.
    await expect(takeCode()).resolves.toMatchObject({ values: { memberNo: 'C-2' } });
  });
});
