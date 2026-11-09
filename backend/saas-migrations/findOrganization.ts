import { Db, ObjectId } from 'mongodb';

export type Organization = { _id: string | ObjectId; subdomain?: string };

const OBJECT_ID_PATTERN = /^[0-9a-f]{24}$/i;

export const findOrganization = async (
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
