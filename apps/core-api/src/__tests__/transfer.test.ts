import { events, withOrg } from '@erxes/core-db';
import { parse } from 'csv-parse/sync';
import { eq } from 'drizzle-orm';
import readXlsxFile from 'read-excel-file/node';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import writeXlsxFile from 'write-excel-file/node';
import { readFileBytes, storeServerFile } from '~/modules/files/files.service';
import { parseDate, suggestMapping } from '~/modules/transfer/columns';
import { parseSheet } from '~/modules/transfer/parse';
import { adminDb, describeWithDb, useTestDatabase } from './db';
import { settle } from './settle';
import { useTwoOrgs } from './support';

const columns = [
  { key: 'name', label: 'Full name', aliases: ['full name', 'name', 'нэр'] },
  { key: 'firstName', label: 'First name', aliases: ['first', 'нэр'] },
  { key: 'lastName', label: 'Last name', aliases: ['овог'] },
  { key: 'primaryEmail', label: 'Email', aliases: ['email', 'e-mail', 'имэйл'] },
  { key: 'primaryPhone', label: 'Phone', aliases: ['phone', 'утас'] },
  { key: 'tags', label: 'Tags', aliases: ['шошго'] },
].map((item) => ({
  ...item,
  group: 'fields' as const,
  importable: true,
  exportable: true,
  default: true,
}));

describe('reading files and suggesting columns', () => {
  it('matches headers in English and Mongolian, each field once', () => {
    expect(
      suggestMapping(['E-mail', 'First Name', 'Овог', 'Утас', 'Шошго', 'Notes'], columns),
    ).toEqual({
      0: 'primaryEmail',
      1: 'firstName',
      2: 'lastName',
      3: 'primaryPhone',
      4: 'tags',
    });
    expect(suggestMapping(['Нэр', 'email', 'EMAIL'], columns)).toEqual({
      0: 'name',
      1: 'primaryEmail',
    });
  });

  it('reads dates as people write them', () => {
    expect(parseDate('2024-3-5')).toBe('2024-03-05');
    expect(parseDate('2024.03.05')).toBe('2024-03-05');
    expect(parseDate('05.03.2024')).toBe('2024-03-05');
    expect(parseDate('2024-03-05T10:00:00Z')).toBe('2024-03-05');
    expect(() => parseDate('2024-02-31')).toThrow('not a date');
    expect(() => parseDate('soon')).toThrow('not a date');
  });

  it('reads CSV (BOM, semicolons, quotes) and Excel the same way', async () => {
    const csv = Buffer.from('﻿Нэр;Email\n"Бат, Болд";bat@x.mn\n\n;\nДорж;dorj@x.mn\n');

    expect(await parseSheet(csv, 'a.csv', 'text/csv')).toEqual({
      headers: ['Нэр', 'Email'],
      rows: [
        ['Бат, Болд', 'bat@x.mn'],
        ['Дорж', 'dorj@x.mn'],
      ],
    });

    const xlsx = await writeXlsxFile([
      [{ value: 'Name' }, { value: 'Born' }, { value: 'Spend' }],
      [
        { value: 'Saraa' },
        { value: new Date(Date.UTC(1990, 4, 1)), type: Date, format: 'yyyy-mm-dd' },
        { value: 1500, type: Number },
      ],
    ]).toBuffer();

    expect(await parseSheet(xlsx, 'a.xlsx', 'application/octet-stream')).toEqual({
      headers: ['Name', 'Born', 'Spend'],
      rows: [['Saraa', '1990-05-01', '1500']],
    });
    await expect(parseSheet(Buffer.from('only a header\n'), 'a.csv', 'text/csv')).rejects.toThrow(
      'no rows',
    );
  });
});

describeWithDb('import and export of contacts', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let spend = '';

  /** A file as if uploaded through /files. */
  const upload = (name: string, body: Buffer) =>
    withOrg(t.ids.org, (tx) =>
      storeServerFile(
        tx,
        { orgId: t.ids.org, actorType: 'user', actorId: t.ids.owner, source: 'core' },
        { name, contentType: 'text/csv', body },
      ),
    );

  /** The file a finished export wrote. */
  const exported = async (id: string) => {
    const { data } = await t.owner().transfer.exports({});
    const fileId = data.find((item) => item.id === id)?.fileId;

    if (!fileId) throw new Error(`export ${id} has no file`);

    return (await withOrg(t.ids.org, (tx) => readFileBytes(tx, t.ids.org, fileId))).body;
  };

  const names = async () =>
    (await t.owner().customers.list({ limit: 100 })).data
      .map((row) => row.firstName ?? '')
      .toSorted((a, b) => a.localeCompare(b));

  const customerTags = async () => (await t.owner().tags.list({ type: 'customer' })).data;

  beforeAll(async () => {
    spend = (
      await t.owner().fields.create({ contentType: 'customer', label: 'Spend', type: 'number' })
    ).id;
    // Already there: the import updates her (upsert by email).
    await t.owner().customers.create({ firstName: 'Saraa', primaryEmail: 'saraa@x.mn' });
  });

  it('imports: suggested mapping, a dry run that changes nothing, the run, and undo', async () => {
    const csv = [
      'Нэр,Овог,Имэйл,Утас,Шошго,Хариуцагч,Байгууллага,Spend,Төрсөн өдөр',
      'Бат,Болд,bat@x.mn,99112233,VIP; Golf,member@acme.mn,Retail Co,1500,1990-05-01',
      'Saraa,,SARAA@x.mn,,VIP,,,200,',
      'Дорж,,dorj@x.mn,,,,,,31.02.1990',
      'Oyun,,oyun@x.mn,,,nobody@acme.mn,,,',
    ].join('\n');

    const file = await upload('people.csv', Buffer.from(csv));

    const created = await t
      .owner()
      .transfer.createImport({ recordType: 'customer', fileId: file.id });

    const { id } = created;
    const current = () => t.owner().transfer.import({ id });

    expect(created.status).toBe('parsing');
    await settle();

    const mapped = await current();

    expect(mapped).toMatchObject({ status: 'mapping', counts: { rows: 4 } });
    expect(mapped.headers).toContain('Имэйл');
    expect(mapped.mapping).toEqual({
      0: 'name',
      1: 'lastName',
      2: 'primaryEmail',
      3: 'primaryPhone',
      4: 'tags',
      5: 'owner',
      6: 'companies',
      7: `customFields.${spend}`,
      8: 'birthDate',
    });
    expect(mapped.sample[0]?.[0]).toBe('Бат');

    // Members can't import unless their role allows it.
    await expect(t.member().transfer.import({ id })).rejects.toMatchObject({ code: 'NOT_ALLOWED' });

    const updated = await t
      .owner()
      .transfer.updateImport({ id, options: { mode: 'upsert', matchBy: 'email' } });

    expect(updated.options).toMatchObject({ mode: 'upsert', matchBy: 'email' });

    // The check: what would happen, nothing changed.
    await t.owner().transfer.checkImport({ id });
    await settle();
    expect(await current()).toMatchObject({
      status: 'checked',
      counts: { rows: 4, create: 1, update: 1, error: 2 },
    });
    expect(await names()).toEqual(['Saraa']);

    const errors = await t.owner().transfer.importRows({ id, action: 'error' });

    expect(errors.data.map((row) => [row.rowNumber, row.error])).toEqual([
      [4, expect.stringContaining('not a date')],
      [5, expect.stringContaining('no team member with the email nobody@acme.mn')],
    ]);

    // The run.
    await t.owner().transfer.startImport({ id });
    await settle();
    expect(await current()).toMatchObject({
      status: 'done',
      counts: { create: 1, update: 1, error: 2 },
      undoable: true,
    });
    expect(await names()).toEqual(['Saraa', 'Бат']);

    const [bat] = (await t.owner().customers.list({ search: 'bat@x.mn' })).data;

    if (!bat) throw new Error('Бат was not imported');

    expect(bat).toMatchObject({
      firstName: 'Бат',
      lastName: 'Болд',
      primaryPhone: '99112233',
      birthDate: '1990-05-01',
      customFields: { [spend]: 1500 },
    });
    expect((await customerTags()).map((tag) => tag.name).toSorted()).toEqual(['Golf', 'VIP']);
    expect((await t.owner().customers.companies({ id: bat.id })).data).toEqual([
      expect.objectContaining({ primaryName: 'Retail Co' }),
    ]);

    const [saraa] = (await t.owner().customers.list({ search: 'saraa' })).data;

    expect(saraa?.customFields[spend]).toBe(200);
    expect(saraa?.tagIds).toHaveLength(1);

    // Quiet by default: its events say so (automations skip them).
    const [event] = await adminDb()
      .select()
      .from(events)
      .where(eq(events.subjectId, bat.id))
      .limit(1);

    expect(event?.payload).toMatchObject({ _import: { id, quiet: true } });

    // The importer is told.
    const inbox = await t.owner().notifications.list({ limit: 20 });

    expect(inbox.data.some((item) => item.kind === 'core.import.done')).toBe(true);

    // Undo: what it created goes; what it updated stays.
    await t.owner().transfer.undoImport({ id });
    await settle();
    expect((await current()).status).toBe('undone');
    expect(await names()).toEqual(['Saraa']);
    expect((await t.owner().trash.list({ limit: 10 })).data.map((item) => item.label)).toEqual([
      'Бат Болд',
    ]);
  });

  it('exports the list as filtered, to CSV and Excel, safe to open', async () => {
    await t.owner().customers.create({
      firstName: '=HYPERLINK("http://evil")',
      primaryEmail: 'evil@x.mn',
    });

    const vip = (await customerTags()).find((tag) => tag.name === 'VIP')?.id;

    const csv = await t.owner().transfer.createExport({
      recordType: 'customer',
      format: 'csv',
      columns: ['firstName', 'primaryEmail', 'tags', `customFields.${spend}`],
      query: {
        filter: { match: 'all', rules: [{ path: 'subject.tagIds', op: 'contains', value: vip }] },
      },
    });

    await expect(
      t.member().transfer.createExport({ recordType: 'customer', columns: ['firstName'] }),
    ).rejects.toMatchObject({ code: 'NOT_ALLOWED' });
    await expect(
      t.owner().transfer.createExport({ recordType: 'customer', columns: ['nope'] }),
    ).rejects.toMatchObject({ code: 'INVALID_COLUMNS' });

    const all = await t.owner().transfer.createExport({
      recordType: 'customer',
      format: 'xlsx',
      columns: ['firstName', 'primaryEmail', 'createdAt'],
    });

    await settle();

    const list = (await t.owner().transfer.exports({})).data;

    expect(list.find((item) => item.id === csv.id)).toMatchObject({ status: 'done', rowCount: 1 });
    expect(list.find((item) => item.id === all.id)).toMatchObject({ status: 'done', rowCount: 2 });

    const text = (await exported(csv.id)).toString('utf8');

    expect(text.startsWith('﻿')).toBe(true);
    expect(parse(text.slice(1))).toEqual([
      ['First name', 'Email', 'Tags', 'Spend'],
      ['Saraa', 'saraa@x.mn', 'VIP', '200'],
    ]);

    const [sheet] = await readXlsxFile(await exported(all.id));
    const rows = sheet?.data ?? [];

    expect(rows[0]).toEqual(['First name', 'Email', 'Created']);
    expect(
      rows
        .slice(1)
        .map((row) => String(row[0]))
        .toSorted(),
    ).toEqual(['=HYPERLINK("http://evil")', 'Saraa']);
    expect(rows[1]?.[2]).toBeInstanceOf(Date);

    // In CSV a formula is kept as text.
    const unsafe = await t
      .owner()
      .transfer.createExport({ recordType: 'customer', format: 'csv', columns: ['firstName'] });

    await settle();
    expect((await exported(unsafe.id)).toString('utf8')).toContain(
      `"'=HYPERLINK(""http://evil"")"`,
    );

    // Exports are in the audit log.
    expect((await t.owner().audit.list({ action: 'contacts.exported' })).data).toHaveLength(3);
  });
});
