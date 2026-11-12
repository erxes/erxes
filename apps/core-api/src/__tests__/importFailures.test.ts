import { withOrg } from '@erxes/core-db';
import { expect, it } from 'vite-plus/test';
import { storeServerFile } from '~/modules/files/files.service';
import { describeWithDb, useTestDatabase } from './db';
import { settle } from './settle';
import { useTwoOrgs } from './support';

describeWithDb('imports of files that cannot be read', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  /** A file as if uploaded through /files. */
  const upload = (name: string, body: string) =>
    withOrg(t.ids.org, (tx) =>
      storeServerFile(
        tx,
        { orgId: t.ids.org, actorType: 'user', actorId: t.ids.owner, source: 'core' },
        { name, contentType: 'text/csv', body: Buffer.from(body) },
      ),
    );

  it('fails the import with the reason the file could not be read', async () => {
    const file = await upload('empty.csv', 'Name,Email\n');

    const { id } = await t
      .owner()
      .transfer.createImport({ recordType: 'customer', fileId: file.id });

    await settle();

    expect(await t.owner().transfer.import({ id })).toMatchObject({
      status: 'failed',
      error: 'The file has no rows under its header',
      counts: { rows: 0 },
    });
  });
});
