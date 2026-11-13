import { expect, it } from 'vite-plus/test';
import { describeWithDb, useTestDatabase } from './db';
import { HR_SECRET } from './plugin';
import { type CoreClient, useTwoOrgs } from './support';

/** Two-step uploads, signed links, limits and who may see or delete a file. */
describeWithDb('files', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  /** Starts an upload and sends the bytes to its signed link. */
  const upload = async (as: CoreClient, name: string, contentType: string, bytes: Buffer) => {
    const started = await as.files.createUpload({ name, contentType, size: bytes.length });

    const put = await fetch(t.url(started.upload.url), {
      method: 'PUT',
      headers: started.upload.headers,
      body: bytes,
    });

    return { started, put };
  };

  const uploaded = async (as: CoreClient, name: string, contentType: string, body: string) => {
    const { started } = await upload(as, name, contentType, Buffer.from(body));

    return as.files.complete({ id: started.file.id });
  };

  it('uploads in two steps and serves the file through a signed link', async () => {
    const bytes = Buffer.from('hello erxes');
    const { started, put } = await upload(t.member(), 'notes.txt', 'text/plain', bytes);

    expect(started.file).toMatchObject({
      name: 'notes.txt',
      status: 'pending',
      size: bytes.length,
    });
    expect(put.status).toBe(204);

    const done = await t.member().files.complete({ id: started.file.id });

    expect(done).toMatchObject({ status: 'ready', uploadedBy: { type: 'user', id: t.ids.member } });

    const got = await t.member().files.get({ id: done.id });
    const download = await fetch(t.url(got.downloadUrl ?? ''));

    expect(await download.text()).toBe('hello erxes');
    expect(download.headers.get('content-disposition')).toMatch(/^inline; filename="notes.txt"/);
    expect(download.headers.get('x-content-type-options')).toBe('nosniff');

    // The stable address redirects signed-in members to a fresh link.
    const redirect = await fetch(t.url(done.url), {
      headers: t.headers(await t.token()),
      redirect: 'manual',
    });

    expect(redirect.status).toBe(302);
    expect(redirect.headers.get('location')).toMatch(/\/core\/v1\/files\/signed\//);
  });

  it('serves risky types as downloads, never inline', async () => {
    const done = await uploaded(t.member(), 'page.html', 'text/html', '<script>1</script>');
    const got = await t.member().files.get({ id: done.id });
    const download = await fetch(t.url(got.downloadUrl ?? ''));

    expect(download.headers.get('content-disposition')).toMatch(/^attachment;/);
    expect(download.headers.get('content-security-policy')).toContain('sandbox');
  });

  it('rejects bytes that differ from what was declared', async () => {
    const started = await t
      .member()
      .files.createUpload({ name: 'a.txt', contentType: 'text/plain', size: 3 });

    const put = await fetch(t.url(started.upload.url), {
      method: 'PUT',
      headers: started.upload.headers,
      body: Buffer.from('longer than three'),
    });

    expect(put.status).toBe(400);
    await expect(t.member().files.complete({ id: started.file.id })).rejects.toMatchObject({
      status: 409,
      code: 'UPLOAD_INCOMPLETE',
    });
  });

  it('refuses forged or reused-for-another-purpose links', async () => {
    const { started } = await upload(t.member(), 'b.txt', 'text/plain', Buffer.from('b'));
    const token = started.upload.url.split('/').at(-1) ?? '';
    const forged = `${token.split('.')[0]}.AAAA`;

    expect((await fetch(t.url(`/core/v1/files/signed/${forged}`))).status).toBe(403);
    // An upload link can't be used to read.
    expect((await fetch(t.url(`/core/v1/files/signed/${token}`))).status).toBe(403);
  });

  it('applies the deployment limit, the blocked list and the organisation settings', async () => {
    const create = (name: string, contentType: string, size = 1) =>
      t.member().files.createUpload({ name, contentType, size });

    await expect(create('big.zip', 'application/zip', 6 * 1024 * 1024)).rejects.toMatchObject({
      status: 400,
      code: 'FILE_TOO_LARGE',
    });
    await expect(create('setup.exe', 'application/octet-stream', 10)).rejects.toMatchObject({
      code: 'FILE_TYPE_NOT_ALLOWED',
    });
    await expect(
      t.member().files.updateSettings({ maxSizeMb: 1, allowedTypes: [] }),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      t.owner().files.updateSettings({ maxSizeMb: 50, allowedTypes: [] }),
    ).rejects.toMatchObject({ code: 'LIMIT_EXCEEDED' });

    expect(
      await t.owner().files.updateSettings({ maxSizeMb: 2, allowedTypes: ['image/*', '.PDF'] }),
    ).toMatchObject({
      maxSizeMb: 2,
      allowedTypes: ['image/*', '.pdf'],
      limitMb: 5,
      storage: 'local',
    });
    await expect(create('a.txt', 'text/plain')).rejects.toMatchObject({
      code: 'FILE_TYPE_NOT_ALLOWED',
    });
    expect((await create('a.png', 'image/png')).file.status).toBe('pending');
    expect((await create('Report.PDF', 'application/pdf')).file.status).toBe('pending');

    await t.owner().files.updateSettings({ maxSizeMb: 5, allowedTypes: [] });
  });

  it('keeps files inside their organisation and lets only the uploader or a manager delete', async () => {
    const { started } = await upload(t.member(), 'c.txt', 'text/plain', Buffer.from('c'));
    const { id } = started.file;

    // Only the uploader can finish an upload.
    await expect(t.owner().files.complete({ id })).rejects.toMatchObject({ status: 404 });
    await t.member().files.complete({ id });

    await expect(t.other().files.get({ id })).rejects.toMatchObject({ status: 404 });

    const download = await fetch(t.url(`/core/v1/files/${id}/download`), {
      headers: t.headers(await t.token(t.ids.otherOwner, t.ids.otherOrg)),
    });

    expect(download.status).toBe(404);

    const list = await t.owner().files.list({ ids: `${id},missing` });

    expect(list.data.map((file) => file.id)).toEqual([id]);

    const ownerFile = await uploaded(t.owner(), 'd.txt', 'text/plain', 'd');

    await expect(t.member().files.remove({ id: ownerFile.id })).rejects.toMatchObject({
      status: 403,
    });
    await t.owner().files.remove({ id });
    await expect(t.owner().files.get({ id })).rejects.toMatchObject({ status: 404 });
  });

  it('lets plugins upload for an organisation', async () => {
    const file = { name: 'x.txt', contentType: 'text/plain', size: 1 };

    // The client secret itself is never accepted on API calls…
    await expect(t.client(HR_SECRET).files.createUpload(file)).rejects.toMatchObject({
      status: 401,
    });
    // …and the deployment-wide token (no organisation) only updates the manifest.
    await expect(t.client(await t.pluginToken()).files.createUpload(file)).rejects.toMatchObject({
      status: 403,
      code: 'ORG_REQUIRED',
    });

    const viaPlugin = await t
      .hr()
      .files.createUpload({ name: 'contract.pdf', contentType: 'application/pdf', size: 4 });

    expect(viaPlugin.file).toMatchObject({
      source: 'hr',
      uploadedBy: { type: 'plugin', id: 'hr' },
    });
  });
});
