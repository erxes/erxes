import { Db, Filter, MongoClient } from 'mongodb';

type TOrganization = { _id: string; subdomain?: string };

export type TTargetDb = { label: string; db: Db };

const toTargetDb = (
  client: MongoClient,
  organization: TOrganization,
): TTargetDb => ({
  label: `${organization.subdomain} (erxes_${organization._id})`,
  db: client.db(`erxes_${organization._id}`),
});

export async function* getTargetDbBatches(
  client: MongoClient,
  batchSize: number,
): AsyncGenerator<TTargetDb[]> {
  const { ALL_ORGS, TARGET_SUBDOMAIN } = process.env;
  const coreDb = client.db();

  if (ALL_ORGS !== 'true' && !TARGET_SUBDOMAIN) {
    yield [{ label: coreDb.databaseName, db: coreDb }];
    return;
  }

  const organizations = coreDb.collection<TOrganization>('organizations');
  const scope: Filter<TOrganization> =
    ALL_ORGS === 'true' ? {} : { subdomain: TARGET_SUBDOMAIN };

  let lastId: string | undefined;
  let found = 0;

  while (true) {
    const filter: Filter<TOrganization> =
      lastId === undefined ? scope : { ...scope, _id: { $gt: lastId } };

    const batch = await organizations
      .find(filter, { projection: { _id: 1, subdomain: 1 } })
      .sort({ _id: 1 })
      .limit(batchSize)
      .toArray();

    if (!batch.length) {
      break;
    }

    found += batch.length;
    lastId = batch[batch.length - 1]._id;

    yield batch.map((organization) => toTargetDb(client, organization));
  }

  if (!found) {
    throw new Error(
      TARGET_SUBDOMAIN
        ? `Organization "${TARGET_SUBDOMAIN}" not found in ${coreDb.databaseName}.organizations`
        : `No organizations in ${coreDb.databaseName}.organizations`,
    );
  }
}
