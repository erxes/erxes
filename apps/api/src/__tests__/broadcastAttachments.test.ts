import { broadcastSchedules } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { runSchedules } from '~/modules/broadcasts/repeating';
import { emailsTo, useBroadcasts } from './broadcasts.fixture';
import { adminDb, useTestDatabase } from './db';
import { settle } from './settle';

const MB = 1024 * 1024;

/** Email broadcasts carry up to 5 stored files, 10 MB together, on every copy and test email. */
describe('broadcast attachments', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useBroadcasts();

  const clients = { owner: () => t.owner(), other: () => t.other() };

  const upload = async (name: string, body: Buffer, who: keyof typeof clients = 'owner') => {
    const started = await clients[who]().files.createUpload({
      name,
      contentType: 'text/plain',
      size: body.length,
    });

    const put = await fetch(t.url(started.upload.url), {
      method: 'PUT',
      headers: started.upload.headers,
      body,
    });

    expect(put.status).toBe(204);

    return clients[who]().files.complete({ id: started.file.id });
  };

  it('attaches the files to every copy and the test email', async () => {
    const owner = t.owner();

    await t.customersIn('attach', [{ primaryEmail: 'one@attach.mn' }]);

    const price = await upload('price.txt', Buffer.from('price list'));
    const terms = await upload('terms.txt', Buffer.from('terms'));
    const draft = await t.emailTo('attach');

    const updated = await owner.broadcasts.update({
      id: draft.id,
      attachmentIds: [price.id, terms.id],
    });

    expect(updated.attachmentIds).toEqual([price.id, terms.id]);

    await owner.broadcasts.test({ id: draft.id, to: ['me@attach.mn'] });
    await owner.broadcasts.send({ id: draft.id });
    await settle();

    for (const address of ['one@attach.mn', 'me@attach.mn']) {
      const [email] = emailsTo(address);

      expect(
        email?.files?.map(({ filename, contentType, content }) => ({
          filename,
          contentType,
          text: content.toString(),
        })),
      ).toEqual([
        { filename: 'price.txt', contentType: 'text/plain', text: 'price list' },
        { filename: 'terms.txt', contentType: 'text/plain', text: 'terms' },
      ]);
    }
  });

  it('refuses more than 5 files, over 10 MB together, a repeated file and SMS attachments', async () => {
    const owner = t.owner();

    const small = await Promise.all(
      [1, 2, 3, 4, 5, 6].map((n) => upload(`f${n}.txt`, Buffer.from(`file ${n}`))),
    );

    const ids = small.map(({ id }) => id);

    await expect(
      owner.broadcasts.create({ name: 'Six', channel: 'email', attachmentIds: ids }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });

    await expect(
      owner.broadcasts.create({
        name: 'Twice',
        channel: 'email',
        attachmentIds: [ids[0] ?? '', ids[0] ?? ''],
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });

    await expect(
      owner.broadcasts.create({ name: 'Text', channel: 'sms', attachmentIds: [ids[0] ?? ''] }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });

    const big = await Promise.all(
      ['a', 'b', 'c'].map((name) => upload(`${name}.txt`, Buffer.alloc(4 * MB, name))),
    );

    await expect(
      owner.broadcasts.create({
        name: 'Big',
        channel: 'email',
        attachmentIds: big.map(({ id }) => id),
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'BROADCAST_ATTACHMENTS_TOO_LARGE',
      data: { maxSizeMb: 10 },
    });

    expect(
      await owner.broadcasts.create({
        name: 'Five',
        channel: 'email',
        attachmentIds: ids.slice(0, 5),
      }),
    ).toMatchObject({ attachmentIds: ids.slice(0, 5) });
  });

  it('refuses another organisation’s file and one still uploading', async () => {
    const owner = t.owner();
    const theirs = await upload('theirs.txt', Buffer.from('globex'), 'other');

    const pending = await owner.files.createUpload({
      name: 'later.txt',
      contentType: 'text/plain',
      size: 5,
    });

    for (const id of [theirs.id, pending.file.id]) {
      await expect(
        owner.broadcasts.create({ name: 'Nope', channel: 'email', attachmentIds: [id] }),
      ).rejects.toMatchObject({
        status: 400,
        code: 'BROADCAST_ATTACHMENT_UNAVAILABLE',
        data: { id },
      });
    }
  });

  it('keeps the files on a duplicate and on a recurring broadcast’s runs', async () => {
    const owner = t.owner();
    const file = await upload('menu.txt', Buffer.from('menu'));

    await t.customersIn('weekly-files', [{ primaryEmail: 'one@weekly-files.mn' }]);

    const source = await t.emailTo('weekly-files');

    await owner.broadcasts.update({ id: source.id, attachmentIds: [file.id] });

    expect(await owner.broadcasts.duplicate({ id: source.id })).toMatchObject({
      attachmentIds: [file.id],
    });

    await owner.broadcastSchedules.start({
      id: source.id,
      frequency: 'day',
      at: '09:00',
      startsOn: '2026-01-01',
    });
    await adminDb()
      .update(broadcastSchedules)
      .set({ nextRunAt: sql`now() - interval '1 minute'` })
      .where(eq(broadcastSchedules.broadcastId, source.id));
    await runSchedules();

    const runs = await owner.broadcasts.list({ parentId: source.id });

    expect(runs.data).toMatchObject([{ attachmentIds: [file.id] }]);

    await settle();

    expect(emailsTo('one@weekly-files.mn')[0]?.files?.map(({ filename }) => filename)).toEqual([
      'menu.txt',
    ]);
  });

  it('fails the send with a clear error when an attached file was deleted', async () => {
    const owner = t.owner();

    await t.customersIn('gone', [{ primaryEmail: 'one@gone.mn' }]);

    const before = await upload('before.txt', Buffer.from('before'));
    const draft = await t.emailTo('gone');

    await owner.broadcasts.update({ id: draft.id, attachmentIds: [before.id] });
    await owner.files.remove({ id: before.id });

    await expect(owner.broadcasts.send({ id: draft.id })).rejects.toMatchObject({
      status: 400,
      code: 'BROADCAST_ATTACHMENT_UNAVAILABLE',
      data: { id: before.id },
    });
    await expect(owner.broadcasts.test({ id: draft.id, to: ['me@gone.mn'] })).rejects.toMatchObject(
      { status: 400, code: 'BROADCAST_ATTACHMENT_UNAVAILABLE' },
    );

    // Deleted after sending started: the broadcast fails and nothing goes out without it.
    const during = await upload('during.txt', Buffer.from('during'));

    await owner.broadcasts.update({ id: draft.id, attachmentIds: [during.id] });
    await owner.broadcasts.send({ id: draft.id });
    await owner.files.remove({ id: during.id });
    await settle();

    expect(await owner.broadcasts.get({ id: draft.id })).toMatchObject({
      status: 'failed',
      error: `The attached file ${during.id} was deleted`,
      stats: { sent: 0 },
    });
    expect(emailsTo('one@gone.mn')).toHaveLength(0);
  });
});
