import * as dotenv from 'dotenv';

dotenv.config();

import { AnyBulkWriteOperation, Db, MongoClient } from 'mongodb';

const {
  MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true',
  CORE_MONGO_URL,
  ORG_CONCURRENCY = '5',
  BATCH_SIZE = '1000',
  DRY_RUN,
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const SUBDOMAINS = [
  'bbelty',
  'cmlbrothers',
  'newhipay',
  'newgreatdate',
  'tsembiibuteelnew',
  'tsembiiautonew',
  'dboilnew',
  'nnewmilestone',
  'sukgardennew',
  'tansagamttannew',
  'dermaestheticnew',
  'burensukhnew',
  'bburensukhburen',
  'newtsemtsgerkharsh',
  'trillionloungenew',
  'cargolinknew',
  'newstrawberry',
];

type SearchTokenMode = 'exact' | 'word' | 'prefix' | 'word-prefix';

type SearchTokenField = {
  path: string;
  mode: SearchTokenMode;
  minLength?: number;
};

type CustomerDocument = { _id: unknown } & Record<string, unknown>;

type OrgResult = {
  subdomain: string;
  dbName: string;
  processed: number;
  error?: string;
};

const DEFAULT_MIN_LENGTH = 3;
const TOKEN_MODE_KEYS: Record<SearchTokenMode, string> = {
  exact: 'e',
  word: 'w',
  prefix: 'p',
  'word-prefix': 'wp',
};

const CUSTOMER_SEARCH_TOKEN_FIELDS: SearchTokenField[] = [
  { path: 'firstName', mode: 'prefix', minLength: 2 },
  { path: 'middleName', mode: 'prefix', minLength: 2 },
  { path: 'lastName', mode: 'prefix', minLength: 2 },
  { path: 'primaryEmail', mode: 'word-prefix', minLength: 3 },
  { path: 'emails', mode: 'word-prefix', minLength: 3 },
  { path: 'primaryPhone', mode: 'word-prefix', minLength: 1 },
  { path: 'phones', mode: 'word-prefix', minLength: 1 },
  { path: 'code', mode: 'exact', minLength: 1 },
  { path: 'visitorContactInfo.email', mode: 'word-prefix', minLength: 3 },
  { path: 'visitorContactInfo.phone', mode: 'word-prefix', minLength: 1 },
];

const isDryRun = DRY_RUN === '1' || DRY_RUN === 'true';
const orgConcurrency = Math.max(1, Number(ORG_CONCURRENCY) || 5);
const batchSize = Math.max(1, Number(BATCH_SIZE) || 1000);

const client = new MongoClient(CORE_MONGO_URL || MONGO_URL);

function extractDbName(url: string): string {
  const withoutQuery = url.split('?')[0];
  return withoutQuery.slice(withoutQuery.lastIndexOf('/') + 1);
}

const normalizeValue = (value: string) =>
  value.normalize('NFKC').toLocaleLowerCase().trim().replace(/\s+/g, ' ');

const splitSearchWords = (value: string): string[] =>
  normalizeValue(value).match(/[\p{L}\p{N}]+/gu) ?? [];

const normalizeExactValue = (value: string) => splitSearchWords(value).join('');

const getValuesAtPath = (source: unknown, path: string): string[] => {
  const value = path.split('.').reduce<unknown>((current, key) => {
    if (current === null || typeof current !== 'object') {
      return undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, source);

  const values = Array.isArray(value) ? value : [value];

  return values
    .filter(
      (item): item is string | number =>
        typeof item === 'string' || typeof item === 'number',
    )
    .map(String)
    .filter(Boolean);
};

const formatToken = (field: SearchTokenField, value: string): string =>
  `${field.path}:${TOKEN_MODE_KEYS[field.mode]}:${value}`;

const generateFieldTokens = (
  value: string,
  field: SearchTokenField,
): string[] => {
  const minLength = field.minLength ?? DEFAULT_MIN_LENGTH;

  if (field.mode === 'exact') {
    const exactValue = normalizeExactValue(value);
    return exactValue.length >= minLength
      ? [formatToken(field, exactValue)]
      : [];
  }

  const words =
    field.mode === 'prefix' ? [normalizeValue(value)] : splitSearchWords(value);

  if (field.mode === 'word') {
    return words
      .filter((word) => word.length >= minLength)
      .map((word) => formatToken(field, word));
  }

  return words.flatMap((word) => {
    const tokens: string[] = [];

    for (let length = minLength; length <= word.length; length += 1) {
      tokens.push(formatToken(field, word.slice(0, length)));
    }

    return tokens;
  });
};

const generateSearchTokens = (source: unknown): string[] => [
  ...new Set(
    CUSTOMER_SEARCH_TOKEN_FIELDS.flatMap((field) =>
      getValuesAtPath(source, field.path).flatMap((value) =>
        generateFieldTokens(value, field),
      ),
    ),
  ),
];

const resolveWantedSubdomains = (): string[] => {
  const orgArg = process.argv.slice(2).find((a) => a.startsWith('--org='));

  if (!orgArg) {
    return SUBDOMAINS;
  }

  return orgArg
    .slice('--org='.length)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

const backfillOrg = async (db: Db, subdomain: string): Promise<number> => {
  const customers = db.collection<CustomerDocument>('customers');
  const projection = Object.fromEntries([
    ['_id', 1],
    ...CUSTOMER_SEARCH_TOKEN_FIELDS.map(({ path }) => [path, 1]),
  ]);

  const cursor = customers
    .find(
      {
        $or: [
          { searchTokens: { $exists: false } },
          { searchTokens: { $size: 0 } },
        ],
      },
      { projection },
    )
    .batchSize(batchSize);

  let batch: AnyBulkWriteOperation<CustomerDocument>[] = [];
  let processed = 0;

  const flush = async () => {
    if (batch.length === 0) {
      return;
    }

    if (!isDryRun) {
      await customers.bulkWrite(batch, { ordered: false });
    }

    processed += batch.length;
    console.log(`[${subdomain}] ${processed} customers`);
    batch = [];
  };

  for await (const customer of cursor) {
    batch.push({
      updateOne: {
        filter: { _id: customer._id },
        update: { $set: { searchTokens: generateSearchTokens(customer) } },
      },
    });

    if (batch.length >= batchSize) {
      await flush();
    }
  }

  await flush();

  return processed;
};

const command = async () => {
  await client.connect();

  const coreDbName = extractDbName(CORE_MONGO_URL || MONGO_URL);
  const coreDb = client.db(coreDbName);
  const wanted = resolveWantedSubdomains();

  const orgs = await coreDb
    .collection('organizations')
    .find(
      { subdomain: { $in: wanted } },
      { projection: { _id: 1, subdomain: 1 } },
    )
    .toArray();

  const missing = wanted.filter((w) => !orgs.some((o) => o.subdomain === w));

  if (missing.length) {
    throw new Error(`Organization(s) not found: ${missing.join(', ')}`);
  }

  console.log(
    `Backfilling customer search tokens for ${orgs.length} org(s), ` +
      `${orgConcurrency} at a time${isDryRun ? ' (DRY_RUN)' : ''}`,
  );

  const results: OrgResult[] = [];
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < orgs.length) {
      const org = orgs[nextIndex++];
      const subdomain = String(org.subdomain);
      const dbName = `erxes_${org._id}`;

      try {
        const processed = await backfillOrg(client.db(dbName), subdomain);
        results.push({ subdomain, dbName, processed });
        console.log(`✔ [${subdomain}] done: ${processed}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        results.push({ subdomain, dbName, processed: 0, error: message });
        console.error(`✖ [${subdomain}] ${dbName} failed: ${message}`);
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(orgConcurrency, orgs.length) }, worker),
  );

  const failed = results.filter((r) => r.error);
  const total = results.reduce((sum, r) => sum + r.processed, 0);

  console.log(
    `Summary: ${results.length - failed.length}/${
      orgs.length
    } org(s) succeeded, ` +
      `${total} customers${isDryRun ? ' would be' : ''} backfilled`,
  );

  for (const f of failed) {
    console.log(`  ✖ ${f.subdomain} (${f.dbName}): ${f.error}`);
  }

  if (failed.length) {
    process.exitCode = 1;
  }
};

command()
  .catch((error: unknown) => {
    console.error('Customer search token backfill failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.close();
    process.exit();
  });
