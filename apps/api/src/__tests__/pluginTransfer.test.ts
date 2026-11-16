import { parse } from 'csv-parse/sync';
import { describe, expect, it } from 'vite-plus/test';
import { readFileBytes, storeServerFile } from '~/modules/files/files.service';
import { useTestDatabase } from './db';
import { pluginApi } from './pluginApi';
import { settle } from './settle';
import { useTwoOrgs } from './support';

/** A plugin's records through core's import and export: core keeps the file and the jobs, the `hr` plugin's API answers the pages. */
describe('import and export of plugin records', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  /** A file as if uploaded through /files. */
  const upload = (name: string, body: Buffer) =>
    storeServerFile(t.ids.org, { name, contentType: 'text/csv', body });

  /** The file a finished export wrote. */
  const exported = async (id: string) => {
    const fileId = (await t.owner().transfer.exports({})).data.find(
      (item) => item.id === id,
    )?.fileId;

    if (!fileId) throw new Error(`export ${id} has no file`);

    return (await readFileBytes(t.ids.org, fileId)).body;
  };

  it("exports and imports a plugin's records through its API, for members it allows", async () => {
    const api = await pluginApi(t.url(''));

    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '3',
      api: { url: api.url },
      permissions: [
        { action: 'hr.employee.export', label: 'Export employees' },
        { action: 'hr.employee.import', label: 'Import employees' },
      ],
      transfer: [
        {
          type: 'hr:employee',
          label: 'employees',
          exportPermission: 'hr.employee.export',
          importPermission: 'hr.employee.import',
          columns: [
            { key: 'name', label: 'Name', aliases: ['Нэр'] },
            { key: 'hiredAt', label: 'Hired', importable: false },
          ],
        },
      ],
    });
    api.answers.transfer = (request) =>
      request.kind === 'export'
        ? request.cursor
          ? { rows: [{ name: '=cmd', hiredAt: null, skills: ['x'] }], cursor: null }
          : { rows: [{ name: 'Bat', hiredAt: '2024-01-02' }], cursor: 'e1' }
        : {
            // Row 4 gets no answer.
            rows: request.rows
              .filter((row) => row.rowNumber < 4)
              .map((row) =>
                row.values.name
                  ? { rowNumber: row.rowNumber, action: 'create', recordId: `e${row.rowNumber}` }
                  : { rowNumber: row.rowNumber, action: 'error', error: 'Name is required' },
              ),
          };

    // Members see the plugin's records once their role holds its permissions.
    expect((await t.member().transfer.types()).data.map((type) => type.recordType)).toEqual([]);
    await expect(
      t.member().transfer.createExport({ recordType: 'hr:employee', columns: ['name'] }),
    ).rejects.toMatchObject({ code: 'NOT_ALLOWED', data: { permission: 'hr.employee.export' } });
    await expect(t.owner().transfer.columns({ recordType: 'hr:nothing' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });

    const role = await t.owner().roles.create({
      name: 'HR clerk',
      permissions: ['hr.employee.export', 'hr.employee.import'],
    });

    await t.owner().users.update({ id: t.ids.member, role: role.key });
    expect((await t.member().transfer.types()).data).toEqual([
      {
        recordType: 'hr:employee',
        label: 'employees',
        plugin: 'hr',
        canImport: true,
        canExport: true,
      },
    ]);
    expect((await t.member().transfer.columns({ recordType: 'hr:employee' })).data).toHaveLength(2);

    // Export: core asks for pages until the cursor is null and writes the file.
    const job = await t.member().transfer.createExport({
      recordType: 'hr:employee',
      format: 'csv',
      columns: ['name', 'hiredAt'],
      query: { search: 'b' },
    });

    await settle();
    expect(api.rejected).toEqual([]);
    expect(api.transfers.map((request) => request.kind === 'export' && request.cursor)).toEqual([
      null,
      'e1',
    ]);
    expect(api.transfers[0]).toMatchObject({
      path: '/transfer/export',
      userId: t.ids.member,
      type: 'hr:employee',
      columns: ['name', 'hiredAt'],
      query: { search: 'b' },
      idempotencyKey: api.transfers[0]?.requestId,
    });
    expect((await t.member().transfer.exports({})).data).toMatchObject([
      { id: job.id, status: 'done', rowCount: 2 },
    ]);
    expect(parse((await exported(job.id)).toString('utf8').slice(1))).toEqual([
      ['Name', 'Hired'],
      ['Bat', '2024-01-02'],
      ["'=cmd", ''],
    ]);
    expect((await t.owner().audit.list({ action: 'hr.employee.exported' })).data).toHaveLength(1);

    // Import: the check and the run each send the batch; the plugin says what each row did.
    const file = await upload('staff.csv', Buffer.from('Нэр,Note\nDorj,a\n,b\nSaraa,c\n'));

    const { id } = await t
      .member()
      .transfer.createImport({ recordType: 'hr:employee', fileId: file.id });

    await settle();
    expect(await t.member().transfer.import({ id })).toMatchObject({ mapping: { 0: 'name' } });
    await t.member().transfer.checkImport({ id });
    await settle();
    expect(await t.member().transfer.import({ id })).toMatchObject({
      status: 'checked',
      counts: { rows: 3, create: 1, error: 2 },
    });
    await t.member().transfer.startImport({ id });
    await settle();

    const done = await t.member().transfer.import({ id });

    expect(done).toMatchObject({
      status: 'done',
      counts: { create: 1, error: 2 },
      undoable: false,
    });
    expect(
      api.transfers.flatMap((request) => (request.kind === 'import' ? [request.dryRun] : [])),
    ).toEqual([true, false]);
    expect(api.transfers.at(-1)).toMatchObject({
      path: '/transfer/import',
      importId: id,
      mode: 'create',
      rows: [
        { rowNumber: 2, values: { name: 'Dorj' } },
        { rowNumber: 3, values: {} },
        { rowNumber: 4, values: { name: 'Saraa' } },
      ],
    });
    expect((await t.member().transfer.importRows({ id })).data).toMatchObject([
      { rowNumber: 2, action: 'create', recordId: 'e2', error: null },
      { rowNumber: 3, action: 'error', error: 'Name is required' },
      { rowNumber: 4, action: 'error', error: 'The plugin did not answer for this row' },
    ]);

    // Their lists hold only the plugin's records; customers stay out of reach.
    expect((await t.member().transfer.imports({})).data.map((item) => item.id)).toEqual([id]);
    await expect(
      t.member().transfer.createExport({ recordType: 'customer', columns: ['firstName'] }),
    ).rejects.toMatchObject({ code: 'NOT_ALLOWED', data: { permission: 'contacts.export' } });

    // Uninstalled: gone from the types, and refused.
    await t.owner().plugins.uninstall({ name: 'hr' });
    expect((await t.member().transfer.types()).data).toEqual([]);
    await expect(
      t.member().transfer.createExport({ recordType: 'hr:employee', columns: ['name'] }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await api.close();
  });
});
