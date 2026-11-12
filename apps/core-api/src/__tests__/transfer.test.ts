import { parse } from 'csv-parse/sync';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import readXlsxFile from 'read-excel-file/node';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import writeXlsxFile from 'write-excel-file/node';
import { createApp } from '~/app';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { parseDate, suggestMapping } from '~/modules/transfer/columns';
import { parseSheet } from '~/modules/transfer/parse';
import { adminDb, currentToken, describeWithDb, useTestDatabase } from './db';
import { settle } from './settle';

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

  let server: Server;
  let base = '';
  let owner = '';
  let member = '';
  let orgId = '';
  let ownerId = '';
  let spend = '';

  const call = async (token: string, method: string, path: string, body?: unknown) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();

    return { status: response.status, body: text ? JSON.parse(text) : null };
  };

  /** A file as if uploaded through /files. */
  const upload = async (name: string, body: Buffer) => {
    const { withOrg } = await import('@erxes/core-db');
    const { storeServerFile } = await import('~/modules/files/files.service');

    return withOrg(orgId, (tx) =>
      storeServerFile(
        tx,
        { orgId, actorType: 'user', actorId: ownerId, source: 'core' },
        { name, contentType: 'text/csv', body },
      ),
    );
  };

  const fileBytes = async (fileId: string) => {
    const { withOrg } = await import('@erxes/core-db');
    const { readFileBytes } = await import('~/modules/files/files.service');

    return (await withOrg(orgId, (tx) => readFileBytes(tx, orgId, fileId))).body;
  };

  const names = async () =>
    (await call(owner, 'GET', '/customers?limit=100')).body.data
      .map((row: { firstName: string }) => row.firstName)
      .sort();

  beforeAll(async () => {
    const { users, newId } = await import('@erxes/core-db');

    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'o@acme.mn' },
    });

    orgId = acme.organization.id;
    ownerId = acme.owner.id;

    const memberId = newId();

    await adminDb()
      .insert(users)
      .values({ id: memberId, orgId, email: 'm@acme.mn', role: 'member', status: 'active' });
    owner = await currentToken(ownerId, orgId);
    member = await currentToken(memberId, orgId);
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    spend = (
      await call(owner, 'POST', '/fields', {
        contentType: 'customer',
        label: 'Spend',
        type: 'number',
      })
    ).body.id;
    // Already there: the import updates her (upsert by email).
    expect(
      (await call(owner, 'POST', '/customers', { firstName: 'Saraa', primaryEmail: 'saraa@x.mn' }))
        .status,
    ).toBe(201);
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('imports: suggested mapping, a dry run that changes nothing, the run, and undo', async () => {
    const csv = [
      'Нэр,Овог,Имэйл,Утас,Шошго,Хариуцагч,Байгууллага,Spend,Төрсөн өдөр',
      'Бат,Болд,bat@x.mn,99112233,VIP; Golf,m@acme.mn,Retail Co,1500,1990-05-01',
      'Saraa,,SARAA@x.mn,,VIP,,,200,',
      'Дорж,,dorj@x.mn,,,,,,31.02.1990',
      'Oyun,,oyun@x.mn,,,nobody@acme.mn,,,',
    ].join('\n');

    const file = await upload('people.csv', Buffer.from(csv));

    const created = await call(owner, 'POST', '/imports', {
      recordType: 'customer',
      fileId: file.id,
    });

    expect(created.status).toBe(201);
    expect(created.body.status).toBe('parsing');
    await settle();

    const mapped = (await call(owner, 'GET', `/imports/${created.body.id}`)).body;

    expect(mapped).toMatchObject({
      status: 'mapping',
      counts: { rows: 4 },
      headers: expect.arrayContaining(['Имэйл']),
    });
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
    expect(mapped.sample[0][0]).toBe('Бат');

    // Members can't import unless their role allows it.
    expect((await call(member, 'GET', `/imports/${created.body.id}`)).body.code).toBe(
      'NOT_ALLOWED',
    );

    expect(
      (
        await call(owner, 'PATCH', `/imports/${created.body.id}`, {
          options: { mode: 'upsert', matchBy: 'email' },
        })
      ).body.options,
    ).toMatchObject({
      mode: 'upsert',
      matchBy: 'email',
    });

    // The check: what would happen, nothing changed.
    await call(owner, 'POST', `/imports/${created.body.id}/check`);
    await settle();

    const checked = (await call(owner, 'GET', `/imports/${created.body.id}`)).body;

    expect(checked).toMatchObject({
      status: 'checked',
      counts: { rows: 4, create: 1, update: 1, error: 2 },
    });
    expect(await names()).toEqual(['Saraa']);

    const errors = (await call(owner, 'GET', `/imports/${created.body.id}/rows?action=error`)).body
      .data;

    expect(
      errors.map((row: { rowNumber: number; error: string }) => [row.rowNumber, row.error]),
    ).toEqual([
      [4, expect.stringContaining('not a date')],
      [5, expect.stringContaining('no team member with the email nobody@acme.mn')],
    ]);

    // The run.
    await call(owner, 'POST', `/imports/${created.body.id}/start`);
    await settle();

    const done = (await call(owner, 'GET', `/imports/${created.body.id}`)).body;

    expect(done).toMatchObject({
      status: 'done',
      counts: { create: 1, update: 1, error: 2 },
      undoable: true,
    });
    expect(await names()).toEqual(['Saraa', 'Бат']);

    const bat = (await call(owner, 'GET', '/customers?search=bat@x.mn')).body.data[0];
    const tags = (await call(owner, 'GET', '/tags?type=customer')).body.data;

    expect(bat).toMatchObject({
      firstName: 'Бат',
      lastName: 'Болд',
      primaryPhone: '99112233',
      birthDate: '1990-05-01',
      customFields: { [spend]: 1500 },
    });
    expect(tags.map((tag: { name: string }) => tag.name).sort()).toEqual(['Golf', 'VIP']);
    expect((await call(owner, 'GET', `/customers/${bat.id}/companies`)).body.data).toEqual([
      expect.objectContaining({ primaryName: 'Retail Co' }),
    ]);

    const saraa = (await call(owner, 'GET', '/customers?search=saraa')).body.data[0];

    expect(saraa.customFields[spend]).toBe(200);
    expect(saraa.tagIds).toHaveLength(1);

    // Quiet by default: its events say so (automations skip them).
    const { events } = await import('@erxes/core-db');
    const { eq } = await import('drizzle-orm');

    const [event] = await adminDb()
      .select()
      .from(events)
      .where(eq(events.subjectId, bat.id))
      .limit(1);

    expect((event!.payload as { _import?: unknown })._import).toEqual({
      id: created.body.id,
      quiet: true,
    });

    // The importer is told.
    const inbox = (await call(owner, 'GET', '/notifications?limit=20')).body.data;

    expect(inbox.some((item: { kind: string }) => item.kind === 'core.import.done')).toBe(true);

    // Undo: what it created goes; what it updated stays.
    await call(owner, 'POST', `/imports/${created.body.id}/undo`);
    await settle();
    expect((await call(owner, 'GET', `/imports/${created.body.id}`)).body.status).toBe('undone');
    expect(await names()).toEqual(['Saraa']);
    expect(
      (await call(owner, 'GET', '/trash?limit=10')).body.data.map(
        (item: { label: string }) => item.label,
      ),
    ).toEqual(['Бат Болд']);
  });

  it('exports the list as filtered, to CSV and Excel, safe to open', async () => {
    await call(owner, 'POST', '/customers', {
      firstName: '=HYPERLINK("http://evil")',
      primaryEmail: 'evil@x.mn',
    });

    const vip = (await call(owner, 'GET', '/tags?type=customer')).body.data.find(
      (tag: { name: string }) => tag.name === 'VIP',
    ).id;

    const query = {
      filter: { match: 'all', rules: [{ path: 'subject.tagIds', op: 'contains', value: vip }] },
    };

    const csv = await call(owner, 'POST', '/exports', {
      recordType: 'customer',
      format: 'csv',
      columns: ['firstName', 'primaryEmail', 'tags', `customFields.${spend}`],
      query,
    });

    expect(csv.status).toBe(202);
    expect(
      (await call(member, 'POST', '/exports', { recordType: 'customer', columns: ['firstName'] }))
        .body.code,
    ).toBe('NOT_ALLOWED');
    expect(
      (await call(owner, 'POST', '/exports', { recordType: 'customer', columns: ['nope'] })).body
        .code,
    ).toBe('INVALID_COLUMNS');

    const all = await call(owner, 'POST', '/exports', {
      recordType: 'customer',
      format: 'xlsx',
      columns: ['firstName', 'primaryEmail', 'createdAt'],
    });

    await settle();

    const list = (await call(owner, 'GET', '/exports')).body.data;
    const csvDone = list.find((item: { id: string }) => item.id === csv.body.id);
    const xlsxDone = list.find((item: { id: string }) => item.id === all.body.id);

    expect(csvDone).toMatchObject({ status: 'done', rowCount: 1 });

    const text = (await fileBytes(csvDone.fileId)).toString('utf8');

    expect(text.startsWith('﻿')).toBe(true);
    expect(parse(text.slice(1))).toEqual([
      ['First name', 'Email', 'Tags', 'Spend'],
      ['Saraa', 'saraa@x.mn', 'VIP', '200'],
    ]);

    expect(xlsxDone).toMatchObject({ status: 'done', rowCount: 2 });

    const sheet = (await readXlsxFile(await fileBytes(xlsxDone.fileId)))[0]!.data;

    expect(sheet[0]).toEqual(['First name', 'Email', 'Created']);
    expect(
      sheet
        .slice(1)
        .map((row) => row[0])
        .sort(),
    ).toEqual(['=HYPERLINK("http://evil")', 'Saraa']);
    expect(sheet[1]![2]).toBeInstanceOf(Date);

    // In CSV a formula is kept as text.
    const unsafe = await call(owner, 'POST', '/exports', {
      recordType: 'customer',
      format: 'csv',
      columns: ['firstName'],
    });

    await settle();

    const unsafeDone = (await call(owner, 'GET', '/exports')).body.data.find(
      (item: { id: string }) => item.id === unsafe.body.id,
    );

    expect((await fileBytes(unsafeDone.fileId)).toString('utf8')).toContain(
      `"'=HYPERLINK(""http://evil"")"`,
    );

    // Exports are in the audit log.
    expect((await call(owner, 'GET', '/audit?action=contacts.exported')).body.data).toHaveLength(3);
  });
});
