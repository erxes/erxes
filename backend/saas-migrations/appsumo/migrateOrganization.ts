import * as dotenv from 'dotenv';

dotenv.config();

import { Db, Document, MongoClient, ObjectId } from 'mongodb';

const {
  MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true',
  CORE_MONGO_URL,
  SOURCE_SUBDOMAIN,
  TARGET_SUBDOMAIN,
  APPSUMO_OWNER_ID,
  APPSUMO_RUN_ID,
  DRY_RUN,
} = process.env;

if (!SOURCE_SUBDOMAIN || !TARGET_SUBDOMAIN) {
  throw new Error(
    'Environment variables SOURCE_SUBDOMAIN and TARGET_SUBDOMAIN must be set.',
  );
}

const sourceRef: string = SOURCE_SUBDOMAIN;
const targetSubdomain: string = TARGET_SUBDOMAIN;
const isDryRun = DRY_RUN === '1' || DRY_RUN === 'true';
const SOURCE = 'appsumo-v1';
const OBJECT_ID_PATTERN = /^[0-9a-f]{24}$/i;
type CoreDocument = Document & { _id: string | ObjectId };
type Owner = { id: string; email: string };

function extractDbName(url: string): string {
  const withoutQuery = url.split('?')[0];
  return withoutQuery.slice(withoutQuery.lastIndexOf('/') + 1);
}

const idVariants = (value: string): (string | ObjectId)[] =>
  OBJECT_ID_PATTERN.test(value) ? [value, new ObjectId(value)] : [value];

const idString = (value: unknown): string => (value ? String(value) : '');

const findHeld = (coreDb: Db, value: string) =>
  coreDb.collection<CoreDocument>('organizations_held').findOne({
    $or: [{ subdomain: value }, { _id: { $in: idVariants(value) } }],
  });

async function resolveOwner(
  coreDb: Db,
  heldOwnerId: string,
  newId: ObjectId,
): Promise<Owner | null> {
  const users = coreDb.collection<CoreDocument>('users');
  const usersHeld = coreDb.collection<CoreDocument>('users_held');
  const addOrganization = async (user: CoreDocument): Promise<Owner> => {
    if (!isDryRun) {
      await users.updateOne(
        { _id: user._id },
        { $addToSet: { organizationIds: String(newId) } },
      );
    }

    return { id: idString(user._id), email: String(user.email || '') };
  };

  for (const candidate of [APPSUMO_OWNER_ID, heldOwnerId]) {
    if (!candidate) {
      continue;
    }

    const active = await users.findOne({ _id: { $in: idVariants(candidate) } });

    if (active) {
      return addOrganization(active);
    }

    const held = await usersHeld.findOne({
      _id: { $in: idVariants(candidate) },
    });

    if (!held) {
      continue;
    }

    const byEmail = held.email
      ? await users.findOne({ email: held.email })
      : null;

    if (byEmail) {
      return addOrganization(byEmail);
    }

    if (!isDryRun) {
      await users.insertOne({
        ...held,
        organizationIds: [
          ...new Set([...(held.organizationIds || []), String(newId)]),
        ],
      });
    }

    return { id: idString(held._id), email: String(held.email || '') };
  }

  return null;
}

function buildOrganization(
  held: CoreDocument | null,
  sourceId: string,
  newId: ObjectId,
  owner: Owner,
  runId: string,
): CoreDocument {
  const now = new Date();

  return {
    _id: newId,
    name: (held && held.name) || targetSubdomain,
    subdomain: targetSubdomain,
    ownerId: OBJECT_ID_PATTERN.test(owner.id)
      ? new ObjectId(owner.id)
      : owner.id,
    status: 'active',
    billing: { status: 'none', lockUntil: null },
    partnerIds: [],
    manualPayment: null,
    createdAt: now,
    updatedAt: now,
    __v: 0,
    charge: { teamMember: { used: 1 } },
    gpOrganizationId: String(newId),
    gpOwnerEmail: owner.email,
    gpStatus: 'new',
    isNext: true,
    onboardingDone: true,
    saas: { organizationId: String(newId), provisionedAt: now },
    migration: {
      runId,
      source: SOURCE,
      sourceOrganizationId: sourceId,
      sourceSubdomain: held ? held.subdomain : sourceRef,
      sourcePlan: held ? held.plan : undefined,
      paymentType: 'free',
      invoiceAfterGift: false,
      provisionedAt: now,
    },
  };
}

async function main() {
  const coreUrl = CORE_MONGO_URL || MONGO_URL;
  const coreDbName = extractDbName(coreUrl);
  const client = new MongoClient(coreUrl);

  await client.connect();

  try {
    const coreDb = client.db(coreDbName);
    const organizations = coreDb.collection<CoreDocument>('organizations');
    const runId =
      APPSUMO_RUN_ID ||
      `appsumo-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;

    if (isDryRun) console.log('** DRY RUN — no data will be written **');

    const held = await findHeld(coreDb, sourceRef);
    const sourceId = held ? idString(held._id) : sourceRef;

    if (!OBJECT_ID_PATTERN.test(sourceId)) {
      throw new Error(
        `Source "${sourceRef}" is not in ${coreDbName}.organizations_held and is not an organization _id`,
      );
    }

    const { databases } = await coreDb
      .admin()
      .listDatabases({ nameOnly: true, filter: { name: `erxes_${sourceId}` } });

    if (!databases.length) {
      throw new Error(`Source database erxes_${sourceId} does not exist`);
    }

    const existing = await organizations.findOne({
      subdomain: targetSubdomain,
    });

    if (existing) {
      const migration = existing.migration || {};

      if (
        migration.source === SOURCE &&
        migration.sourceOrganizationId === sourceId
      ) {
        console.log(
          `Target "${targetSubdomain}" already provisioned: ${idString(
            existing._id,
          )} (run ${migration.runId})`,
        );
        return;
      }

      throw new Error(
        `Subdomain "${targetSubdomain}" already belongs to organization ${idString(
          existing._id,
        )}`,
      );
    }

    const newId = new ObjectId();
    const owner = await resolveOwner(
      coreDb,
      held ? idString(held.ownerId) : '',
      newId,
    );

    if (!owner) {
      throw new Error(
        `No owner: set APPSUMO_OWNER_ID to a user _id in ${coreDbName}.users` +
          (held ? ` (held owner ${idString(held.ownerId)} not found)` : ''),
      );
    }

    const doc = buildOrganization(held, sourceId, newId, owner, runId);

    if (!isDryRun) {
      await organizations.insertOne(doc);
    }

    console.log(`Source: ${sourceRef} → erxes_${sourceId}`);
    console.log(
      `Target: ${targetSubdomain} → erxes_${String(newId)} (owner: ${owner.id}${
        owner.email ? ` ${owner.email}` : ''
      }, run: ${runId})`,
    );
  } finally {
    await client.close();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });
