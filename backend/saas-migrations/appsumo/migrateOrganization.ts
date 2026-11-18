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
  APPSUMO_BUNDLE_CODE = 'everything',
  APPSUMO_PRODUCT_CODE = 'erxes-everything',
  APPSUMO_FREE_PLUGINS = 'frontline,sales,operation,content,loyalty,payment,accounting,tourism,posclient,mongolian,erxes-agent,insurance',
  APPSUMO_PLAN_INTERVAL = 'yearly',
  APPSUMO_PLAN_MONTHS = '120',
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

type Plan = { bundleId: string; productId: string; bundle: CoreDocument };

let resolvedPlan: Plan | undefined;

async function resolvePlan(coreDb: Db): Promise<Plan> {
  if (resolvedPlan) {
    return resolvedPlan;
  }

  const bundle = await coreDb
    .collection<CoreDocument>('bundles')
    .findOne({ code: APPSUMO_BUNDLE_CODE });
  const product = await coreDb
    .collection<CoreDocument>('products')
    .findOne({ code: APPSUMO_PRODUCT_CODE });

  if (!bundle) {
    throw new Error(
      `Bundle with code "${APPSUMO_BUNDLE_CODE}" not found in ${coreDb.databaseName}.bundles`,
    );
  }

  if (!product) {
    throw new Error(
      `Product with code "${APPSUMO_PRODUCT_CODE}" not found in ${coreDb.databaseName}.products`,
    );
  }

  for (const [kind, doc] of [
    ['Bundle', bundle],
    ['Product', product],
  ] as const) {
    if (doc.status && doc.status !== 'active') {
      console.warn(`${kind} "${doc.code}" has status ${doc.status}`);
    }
  }

  resolvedPlan = {
    bundleId: idString(bundle._id),
    productId: idString(product._id),
    bundle,
  };

  console.log(
    `Plan: bundle "${bundle.title}" (${resolvedPlan.bundleId}), product "${product.title}" (${resolvedPlan.productId})`,
  );

  return resolvedPlan;
}

function buildOrganization(
  held: CoreDocument | null,
  sourceId: string,
  newId: ObjectId,
  owner: Owner,
  runId: string,
  plan: Plan,
  appsumoCodes: number,
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
    bundleId: plan.bundleId,
    productId: plan.productId,
    onboardingDone: true,
    saas: { organizationId: String(newId), provisionedAt: now },
    migration: {
      runId,
      source: SOURCE,
      sourceOrganizationId: sourceId,
      sourceSubdomain: held ? held.subdomain : sourceRef,
      sourcePlan: held ? held.plan : undefined,
      appsumoCodes,
      appsumoTier:
        appsumoCodes > 0 ? `appsumo${Math.min(appsumoCodes, 5)}` : undefined,
      paymentType: 'free',
      invoiceAfterGift: false,
      provisionedAt: now,
    },
  };
}

async function freePlugins(coreDb: Db): Promise<string[]> {
  if (APPSUMO_FREE_PLUGINS) {
    return APPSUMO_FREE_PLUGINS.split(',')
      .map((code) => code.trim())
      .filter(Boolean);
  }

  const { bundle } = await resolvePlan(coreDb);

  const limits: Record<string, number> = bundle.pluginLimits || {};
  const plugins = new Set<string>();

  for (const [key, limit] of Object.entries(limits)) {
    const [plugin] = key.split(':');

    if (key.includes(':') && plugin !== 'core' && Number(limit) > 0) {
      plugins.add(plugin);
    }
  }

  return [...plugins];
}

async function createStripeCustomer(
  organizationId: string,
  owner: Owner,
  plugins: string[],
): Promise<string> {
  const body = new URLSearchParams({
    name: targetSubdomain,
    email: owner.email,
    'metadata[subdomain]': targetSubdomain,
    'metadata[organizationId]': organizationId,
    'metadata[source]': SOURCE,
    'metadata[free_plugins]': plugins.join(','),
  });
  const response = await fetch('https://api.stripe.com/v1/customers', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GP2_STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': `${SOURCE}-${organizationId}`,
    },
    body,
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(
      `Stripe customers: ${response.status} ${await response.text()}`,
    );
  }

  const customer = (await response.json()) as { id: string };

  return customer.id;
}

async function ensureStripeCustomer(
  coreDb: Db,
  organization: CoreDocument,
  owner: Owner,
) {
  const organizationId = idString(organization._id);
  const plugins = await freePlugins(coreDb);

  if (organization.gpStripeCustomerId) {
    console.log(
      `Stripe customer ${
        organization.gpStripeCustomerId
      } already set; plugins stay as Stripe grants them (bundle would give: ${plugins.join(
        ', ',
      )})`,
    );
    return;
  }

  if (!GP2_STRIPE_SECRET_KEY) {
    console.warn(
      `GP2_STRIPE_SECRET_KEY is not set: no Stripe customer, so the organization gets no plugins (bundle would give: ${plugins.join(
        ', ',
      )})`,
    );
    return;
  }

  if (isDryRun) {
    console.log(
      `Stripe customer would be created with free_plugins: ${plugins.join(
        ', ',
      )}`,
    );
    return;
  }

  const customerId = await createStripeCustomer(organizationId, owner, plugins);

  await coreDb.collection<CoreDocument>('organizations').updateOne(
    { _id: organization._id },
    {
      $set: {
        gpStripeCustomerId: customerId,
        'billing.customerId': customerId,
        updatedAt: new Date(),
      },
    },
  );

  console.log(
    `Stripe customer ${customerId} created with free_plugins: ${plugins.join(
      ', ',
    )}`,
  );
}

async function ensurePlanHistory(coreDb: Db, organizationId: string) {
  const plan = await resolvePlan(coreDb);
  const histories = coreDb.collection('organization_plan_histories');
  const active = await histories.countDocuments({
    organizationId,
    status: 'active',
  });

  if (active > 0) {
    console.log(`Plan history: ${active} active record(s) already present`);
    return;
  }

  const now = new Date();
  const endsAt = new Date(now);
  endsAt.setMonth(endsAt.getMonth() + Number(APPSUMO_PLAN_MONTHS));

  if (!isDryRun) {
    await histories.insertOne({
      organizationId,
      source: 'onboarding',
      status: 'active',
      isNext: true,
      productId: plan.productId,
      bundleId: plan.bundleId,
      interval: APPSUMO_PLAN_INTERVAL,
      pluginsLimitsSnapshot: {},
      startsAt: now,
      endsAt,
      createdAt: now,
      updatedAt: now,
      __v: 0,
    });
  }

  console.log(
    `Plan history: ${APPSUMO_PLAN_INTERVAL} until ${endsAt.toISOString()}`,
  );
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
        await ensurePlanHistory(coreDb, idString(existing._id));

        const existingOwner = await coreDb
          .collection<CoreDocument>('users')
          .findOne({ _id: { $in: idVariants(idString(existing.ownerId)) } });

        await ensureStripeCustomer(coreDb, existing, {
          id: idString(existing.ownerId),
          email: String(
            (existingOwner && existingOwner.email) ||
              existing.gpOwnerEmail ||
              '',
          ),
        });
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

    const appsumoCodes = held
      ? await coreDb.collection('promo_codes').countDocuments({
          type: 'appsumo',
          status: 'redeemed',
          usedBy: held.subdomain,
        })
      : 0;
    const doc = buildOrganization(
      held,
      sourceId,
      newId,
      owner,
      runId,
      await resolvePlan(coreDb),
      appsumoCodes,
    );

    if (!isDryRun) {
      await organizations.insertOne(doc);
    }

    await ensurePlanHistory(coreDb, String(newId));
    await ensureStripeCustomer(coreDb, doc, owner);

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
