import { Db, MongoClient } from 'mongodb';
import { findOrganization, Organization } from '../../findOrganization';

/**
 * The databases a command runs on, picked from the environment:
 * - `ALL_ORGS=true` (SaaS): every organization in core's `organizations`,
 *   each in its own `erxes_<organizationId>` database;
 * - `TARGET_SUBDOMAIN` (SaaS, one organization, by subdomain or `_id`; set by
 *   run-commands.ts and the migrations Kubernetes Job): that organization's
 *   database;
 * - neither (self-hosted): the database named in `MONGO_URL`.
 *
 * Connect the client to `CORE_MONGO_URL || MONGO_URL`: the core database on
 * SaaS, the erxes database on a self-hosted server.
 * Not a command itself: run-commands.ts skips files starting with `_`.
 */
export const getTargetDbs = async (
  client: MongoClient,
): Promise<{ label: string; db: Db }[]> => {
  const { ALL_ORGS, TARGET_SUBDOMAIN } = process.env;
  // The database named in the URL the client connected to.
  const coreDb = client.db();

  if (ALL_ORGS !== 'true' && !TARGET_SUBDOMAIN) {
    return [{ label: coreDb.databaseName, db: coreDb }];
  }

  const organizations: Organization[] = [];

  if (ALL_ORGS === 'true') {
    organizations.push(
      ...(await coreDb
        .collection<Organization>('organizations')
        .find({}, { projection: { _id: 1, subdomain: 1 } })
        .toArray()),
    );
  } else {
    const organization = await findOrganization(coreDb, TARGET_SUBDOMAIN);

    if (organization) {
      organizations.push(organization);
    }
  }

  if (!organizations.length) {
    throw new Error(
      TARGET_SUBDOMAIN
        ? `Organization "${TARGET_SUBDOMAIN}" not found in ${coreDb.databaseName}.organizations`
        : `No organizations in ${coreDb.databaseName}.organizations`,
    );
  }

  return organizations.map((organization) => ({
    label: `${organization.subdomain} (erxes_${organization._id})`,
    db: client.db(`erxes_${organization._id}`),
  }));
};
