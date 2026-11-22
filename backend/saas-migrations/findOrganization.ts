import { Db, ObjectId } from 'mongodb';

export type Organization = { _id: string | ObjectId; subdomain?: string };

const OBJECT_ID_PATTERN = /^[0-9a-f]{24}$/i;

export const findRegisteredOrganization = async (
  coreDb: Db,
  subdomainOrId: string | undefined,
): Promise<Organization | null> => {
  if (!subdomainOrId) {
    return null;
  }

  const organizations = coreDb.collection<Organization>('organizations');
  const projection = { _id: 1, subdomain: 1 };
  const ids: Organization['_id'][] = OBJECT_ID_PATTERN.test(subdomainOrId)
    ? [subdomainOrId, new ObjectId(subdomainOrId)]
    : [subdomainOrId];

  const [bySubdomain, byId] = await Promise.all([
    organizations.findOne({ subdomain: subdomainOrId }, { projection }),
    organizations.findOne({ _id: { $in: ids } }, { projection }),
  ]);

  if (bySubdomain && byId && String(bySubdomain._id) !== String(byId._id)) {
    throw new Error(
      `"${subdomainOrId}" is ambiguous: it is the subdomain of organization ${bySubdomain._id} and the _id of another organization.`,
    );
  }

  return bySubdomain || byId;
};

const databaseExists = async (coreDb: Db, name: string): Promise<boolean> => {
  const { databases } = await coreDb
    .admin()
    .listDatabases({ nameOnly: true, filter: { name } });

  return databases.some((database) => database.name === name);
};

export const findOrganization = async (
  coreDb: Db,
  subdomainOrId: string | undefined,
): Promise<Organization | null> => {
  if (!subdomainOrId) {
    return null;
  }

  if (!OBJECT_ID_PATTERN.test(subdomainOrId)) {
    return coreDb
      .collection<Organization>('organizations')
      .findOne(
        { subdomain: subdomainOrId },
        { projection: { _id: 1, subdomain: 1 } },
      );
  }

  const databaseName = `erxes_${subdomainOrId}`;

  if (!(await databaseExists(coreDb, databaseName))) {
    console.warn(`Database ${databaseName} does not exist yet.`);
  }

  console.log(
    `Using database ${databaseName} directly for "${subdomainOrId}".`,
  );

  return { _id: subdomainOrId };
};

export const findSourceOrganization = findOrganization;
