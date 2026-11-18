import * as dotenv from 'dotenv';

dotenv.config();

import { Db, Document, MongoClient, ObjectId } from 'mongodb';
import { findOrganization } from '../../findOrganization';

const {
  MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true',
  CORE_MONGO_URL,
  SOURCE_SUBDOMAIN,
  TARGET_SUBDOMAIN,
  GP2_STRIPE_SECRET_KEY,
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
const OBJECT_ID_PATTERN = /^[0-9a-f]{24}$/i;

type CoreDocument = Document & { _id: string | ObjectId };
type UserDocument = {
  _id: string | ObjectId;
  email?: string;
  organizationIds?: string[];
};
type Owner = { id: string; email: string };

function extractDbName(url: string): string {
  const withoutQuery = url.split('?')[0];
  return withoutQuery.slice(withoutQuery.lastIndexOf('/') + 1);
}

const idVariants = (value: string): (string | ObjectId)[] =>
  OBJECT_ID_PATTERN.test(value) ? [value, new ObjectId(value)] : [value];

const idString = (value: unknown): string => (value ? String(value) : '');

const ownerOf = (user: UserDocument): Owner => ({
  id: idString(user._id),
  email: String(user.email || ''),
});

async function restoreHeldOwner(
  coreDb: Db,
  heldOwnerId: string,
  organizationId: string,
): Promise<Owner | null> {
  const users = coreDb.collection<UserDocument>('users');
  const active = await users.findOne({ _id: { $in: idVariants(heldOwnerId) } });

  if (active) {
    if (!isDryRun) {
      await users.updateOne(
        { _id: active._id },
        { $addToSet: { organizationIds: organizationId } },
      );
    }

    return ownerOf(active);
  }

  const held = await coreDb
    .collection<UserDocument>('users_held')
    .findOne({ _id: { $in: idVariants(heldOwnerId) } });

  if (!held) {
    return null;
  }

  const byEmail = held.email
    ? await users.findOne({ email: held.email })
    : null;

  if (byEmail) {
    if (!isDryRun) {
      await users.updateOne(
        { _id: byEmail._id },
        { $addToSet: { organizationIds: organizationId } },
      );
    }

    return ownerOf(byEmail);
  }

  if (!isDryRun) {
    await users.insertOne({
      ...held,
      organizationIds: [
        ...new Set([...(held.organizationIds || []), organizationId]),
      ],
    });
  }

  return ownerOf(held);
}

async function updateStripeEmail(customerId: string, email: string) {
  const response = await fetch(
    `https://api.stripe.com/v1/customers/${encodeURIComponent(customerId)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GP2_STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ email }),
      signal: AbortSignal.timeout(15000),
    },
  );

  if (!response.ok) {
    throw new Error(`Stripe customers/${customerId}: ${response.status}`);
  }
}

async function main() {
  const coreUrl = CORE_MONGO_URL || MONGO_URL;
  const coreDbName = extractDbName(coreUrl);
  const client = new MongoClient(coreUrl);

  await client.connect();

  try {
    const coreDb = client.db(coreDbName);
    const organizations = coreDb.collection<CoreDocument>('organizations');
    const users = coreDb.collection<UserDocument>('users');

    if (isDryRun) console.log('** DRY RUN — no data will be written **');

    const targetRef = await findOrganization(coreDb, targetSubdomain);

    if (!targetRef) {
      throw new Error(
        `Target organization "${targetSubdomain}" not found in ${coreDbName}.organizations`,
      );
    }

    const target = (await organizations.findOne({
      _id: targetRef._id,
    })) as CoreDocument;
    const organizationId = idString(target._id);
    const held = await coreDb
      .collection<CoreDocument>('organizations_held')
      .findOne({
        $or: [
          { subdomain: sourceRef },
          { _id: { $in: idVariants(sourceRef) } },
        ],
      });

    if (!held) {
      throw new Error(
        `Source organization "${sourceRef}" not found in ${coreDbName}.organizations_held`,
      );
    }

    const heldOwnerId = idString(held.ownerId);

    if (!heldOwnerId) {
      throw new Error(`Source organization "${held.subdomain}" has no ownerId`);
    }

    const currentId = idString(target.ownerId);
    const current = await users.findOne({
      _id: { $in: idVariants(currentId) },
    });
    const currentEmail = String(
      (current && current.email) || target.gpOwnerEmail || '',
    );

    console.log(
      `Target: ${targetSubdomain} (${organizationId})  current owner: ${currentId}${
        currentEmail ? ` ${currentEmail}` : ''
      }`,
    );

    if (currentId === heldOwnerId) {
      console.log(
        'Owner already matches the source organization; nothing to do.',
      );
      return;
    }

    const owner = await restoreHeldOwner(coreDb, heldOwnerId, organizationId);

    if (!owner) {
      throw new Error(
        `Source owner ${heldOwnerId} not found in ${coreDbName}.users or users_held`,
      );
    }

    if (owner.id === currentId) {
      console.log(
        'Owner already matches the source organization; nothing to do.',
      );
      return;
    }

    if (!isDryRun) {
      await organizations.updateOne(
        { _id: target._id },
        {
          $set: {
            ownerId: OBJECT_ID_PATTERN.test(owner.id)
              ? new ObjectId(owner.id)
              : owner.id,
            gpOwnerEmail: owner.email,
            updatedAt: new Date(),
          },
        },
      );

      if (current) {
        await users.updateOne(
          { _id: current._id },
          { $pull: { organizationIds: organizationId } },
        );
      }

      if (GP2_STRIPE_SECRET_KEY && target.gpStripeCustomerId && owner.email) {
        await updateStripeEmail(String(target.gpStripeCustomerId), owner.email);
      }
    }

    console.log(
      `Owner restored: ${currentId}${
        currentEmail ? ` ${currentEmail}` : ''
      } → ${owner.id}${owner.email ? ` ${owner.email}` : ''}${
        target.gpStripeCustomerId
          ? ` (Stripe customer ${target.gpStripeCustomerId} email ${
              GP2_STRIPE_SECRET_KEY
                ? 'updated'
                : 'not updated: no GP2_STRIPE_SECRET_KEY'
            })`
          : ''
      }`,
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
