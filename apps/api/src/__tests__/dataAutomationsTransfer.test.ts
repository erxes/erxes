import { parse } from 'csv-parse/sync';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { readFileBytes, storeServerFile } from '~/modules/files/files.service';
import { useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';
import { settle } from './settle';

/** Automations, imports and exports name Data Extensions fields as they name custom fields. */
describe('Data Extensions fields in automations, imports and exports', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useAutomations();

  beforeAll(async () => {
    const owner = t.owner();

    await owner.dataFields.create({
      recordType: 'core.customer',
      key: 'tier',
      label: 'Tier',
      type: 'select',
      options: [
        { value: 'gold', label: 'Gold', color: 'yellow' },
        { value: 'silver', label: 'Silver', color: 'gray' },
      ],
    });
    await owner.dataFields.create({
      recordType: 'core.customer',
      key: 'spend',
      label: 'Spend',
      type: 'number',
    });
  });

  it('starts on, reads and writes a customer’s fields', async () => {
    const owner = t.owner();
    const gold = await owner.customers.create({ firstName: 'Gold', values: { tier: 'gold' } });

    const silver = await owner.customers.create({
      firstName: 'Silver',
      values: { tier: 'silver' },
    });

    const id = await t.active('Gold customers', {
      trigger: {
        kind: 'manual',
        audience: {
          type: 'customer',
          conditions: {
            match: 'all',
            rules: [{ path: 'subject.data.tier', op: 'eq', value: 'gold' }],
          },
        },
      },
      steps: [
        {
          id: 'note',
          type: 'action',
          action: 'core.note.add',
          input: { body: 'Tier {{subject.data.tier}}' },
        },
        {
          id: 'spend',
          type: 'action',
          action: 'core.customer.set_data_value',
          input: { field: 'spend', value: '250' },
        },
      ],
    });

    expect(await owner.automations.start({ id, subjects: [gold.id, silver.id] })).toMatchObject({
      started: 1,
      skipped: 1,
    });
    await settle();

    const [run] = await t.runsOf(id);

    expect(run).toMatchObject({ subjectId: gold.id, status: 'succeeded' });
    expect((await owner.customers.get({ id: gold.id })).values).toEqual({
      tier: 'gold',
      spend: 250,
    });

    const notes = await owner.activities.list({
      targetType: 'customer',
      targetId: gold.id,
      kind: 'notes',
    });

    expect(JSON.stringify(notes.data.map((item) => item.note?.body))).toContain('Tier gold');
  });

  it('imports into the fields and exports them', async () => {
    const owner = t.owner();
    const csv = ['First name,Tier,Spend', 'Anu,Silver,120', 'Bat,gold,1 500'].join('\n');

    const file = await storeServerFile(t.ids.org, {
      name: 'people.csv',
      contentType: 'text/csv',
      body: Buffer.from(csv),
    });

    const { id } = await owner.transfer.createImport({ recordType: 'customer', fileId: file.id });

    await settle();
    expect((await owner.transfer.import({ id })).mapping).toEqual({
      0: 'firstName',
      1: 'data.tier',
      2: 'data.spend',
    });
    await owner.transfer.startImport({ id });
    await settle();
    expect(await owner.transfer.import({ id })).toMatchObject({
      status: 'done',
      counts: { create: 2, error: 0 },
    });

    const imported = (await owner.customers.list({ sortField: 'data.spend', limit: 10 })).data;

    expect(
      imported
        .filter((row) => row.firstName === 'Anu' || row.firstName === 'Bat')
        .map((row) => row.values),
    ).toEqual([
      { tier: 'silver', spend: 120 },
      { tier: 'gold', spend: 1500 },
    ]);

    const exported = await owner.transfer.createExport({
      recordType: 'customer',
      format: 'csv',
      columns: ['firstName', 'data.tier', 'data.spend'],
      query: {
        filter: { match: 'all', rules: [{ path: 'subject.data.spend', op: 'gt', value: 1000 }] },
      },
    });

    await settle();

    const fileId = (await owner.transfer.exports({})).data.find(
      (item) => item.id === exported.id,
    )?.fileId;

    const text = (await readFileBytes(t.ids.org, fileId ?? '')).body.toString('utf8');

    expect(parse(text.slice(1))).toEqual([
      ['First name', 'Tier', 'Spend'],
      ['Bat', 'gold', '1500'],
    ]);
  });
});
