/* global db, print, printjson, sleep */

// Run with mongosh, not Node.js. This intentionally talks directly to MongoDB
// so a large benchmark seed does not trigger application hooks or activity logs.

const env = process.env;
const target = Number(env.TARGET || 20_000_000);
const batchSize = Number(env.BATCH_SIZE || 5_000);
const pipelineId = env.PIPELINE_ID || 'j-FdKesrH1uTRihodB9y-';
const throttleMs = Number(env.THROTTLE_MS || 0);
const allowNonEmpty = env.ALLOW_NON_EMPTY === '1';
const resetState = env.RESET_STATE === '1';
const seedKey = env.SEED_KEY || `deals:${pipelineId}:v1`;

if (!Number.isSafeInteger(target) || target < 1) {
  throw new Error('TARGET must be a positive safe integer');
}

if (!Number.isSafeInteger(batchSize) || batchSize < 1 || batchSize > 50_000) {
  throw new Error('BATCH_SIZE must be between 1 and 50000');
}

const deals = db.getCollection('deals');
const states = db.getCollection('_benchmark_seed_state');
const stages = db
  .getCollection('sales_stages')
  .find({ pipelineId, status: { $ne: 'archived' } }, { _id: 1, order: 1 })
  .sort({ order: 1, _id: 1 })
  .toArray();

if (!stages.length) {
  throw new Error(`No active sales stages found for pipeline ${pipelineId}`);
}

const currentDealCount = deals.countDocuments({});

if (resetState) {
  states.deleteOne({ _id: seedKey });
}

const savedState = resetState ? null : states.findOne({ _id: seedKey });

if (currentDealCount > 0 && !allowNonEmpty && !savedState) {
  throw new Error(
    `deals is not empty (${currentDealCount} documents). ` +
      'Set ALLOW_NON_EMPTY=1 only when mixing benchmark rows is intentional.',
  );
}

const stageIds = stages.map((stage) => String(stage._id));

if (
  savedState &&
  JSON.stringify(savedState.stageIds) !== JSON.stringify(stageIds)
) {
  throw new Error(
    'Saved checkpoint stage IDs differ from the current pipeline. ' +
      'Use a new SEED_KEY or RESET_STATE=1 after verifying the target data.',
  );
}

let nextIndex = Number(savedState?.nextIndex || 0);

if (nextIndex > target) {
  throw new Error(
    `Checkpoint nextIndex (${nextIndex}) is greater than TARGET (${target})`,
  );
}

const firstNames = [
  'Bataa',
  'Nomin',
  'Dorj',
  'Uranbileg',
  'Tuguldur',
  'Munkhbat',
  'Erdenebat',
  'Sarangerel',
  'Purevdorj',
  'Gantulga',
  'Khulan',
  'Oyunbileg',
];
const lastNames = [
  'Batsaikhan',
  'Ganbaatar',
  'Sukhbaatar',
  'Tumurbaatar',
  'Munkhjargal',
  'Chuluun',
  'Jargal',
  'Otgonbayar',
  'Gombo',
  'Damdin',
  'Zorigt',
  'Enkhee',
];
const currencies = ['MNT', 'USD', 'EUR'];
const priorities = ['Critical', 'High', 'Normal', 'Low'];
const baseCreatedAt = Date.UTC(2025, 0, 1);

const pad = (value, width) => String(value).padStart(width, '0');

const makeDeal = (index) => {
  const stageId = stageIds[index % stageIds.length];
  const firstName = firstNames[index % firstNames.length];
  const lastName =
    lastNames[Math.floor(index / firstNames.length) % lastNames.length];
  const phone = 80_000_000 + (index % 20_000_000);
  const amount = 10_000 + (index % 990_000);
  const currency = currencies[index % currencies.length];
  const createdAt = new Date(baseCreatedAt + index * 1_000);

  return {
    _id: `bench_deal_${pad(index, 12)}`,
    benchmarkSeed: seedKey,
    name: `${phone} ${firstName} ${lastName}`,
    number: `D${pad(index, 12)}`,
    stageId,
    initialStageId: stageId,
    order: Math.floor(index / stageIds.length),
    status: 'active',
    priority: priorities[index % priorities.length],
    assignedUserIds: [],
    watchedUserIds: [],
    labelIds: [],
    tagIds: [],
    branchIds: [],
    departmentIds: [],
    productsData: [
      {
        _id: `bench_product_data_${pad(index, 12)}`,
        name: `Benchmark product ${index % 1_000}`,
        currency,
        quantity: 1 + (index % 5),
        unitPrice: amount,
        amount,
        tickUsed: index % 5 !== 0,
      },
    ],
    totalAmount: amount,
    unUsedTotalAmount: index % 5 === 0 ? amount : 0,
    bothTotalAmount: amount,
    propertiesData: {
      benchmarkCode: `CODE-${index % 100_000}`,
      benchmarkGroup: `GROUP-${index % 100}`,
    },
    createdAt,
    updatedAt: createdAt,
  };
};

const startedAt = Date.now();

printjson({
  action: 'seed-deals-start',
  database: db.getName(),
  pipelineId,
  stageIds,
  target,
  batchSize,
  resumeFrom: nextIndex,
  currentDealCount,
  seedKey,
});

while (nextIndex < target) {
  const endIndex = Math.min(nextIndex + batchSize, target);
  const documents = [];

  for (let index = nextIndex; index < endIndex; index += 1) {
    documents.push(makeDeal(index));
  }

  try {
    deals.insertMany(documents, { ordered: false });
  } catch (error) {
    const writeErrors = error?.writeErrors || [];
    const onlyDuplicates =
      (error?.code === 11000 || writeErrors.length > 0) &&
      writeErrors.every((writeError) => writeError.code === 11000);

    if (!onlyDuplicates) {
      throw error;
    }
  }

  nextIndex = endIndex;
  states.updateOne(
    { _id: seedKey },
    {
      $set: {
        pipelineId,
        stageIds,
        target,
        batchSize,
        nextIndex,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true },
  );

  const elapsedSeconds = (Date.now() - startedAt) / 1_000;
  const insertedThisRun = nextIndex - Number(savedState?.nextIndex || 0);
  const rate = insertedThisRun / Math.max(elapsedSeconds, 0.001);
  const remainingSeconds = (target - nextIndex) / Math.max(rate, 0.001);

  printjson({
    progress: nextIndex,
    target,
    percent: Number(((nextIndex / target) * 100).toFixed(2)),
    documentsPerSecond: Math.round(rate),
    etaMinutes: Number((remainingSeconds / 60).toFixed(1)),
  });

  if (throttleMs > 0) {
    sleep(throttleMs);
  }
}

printjson({
  action: 'seed-deals-complete',
  seedKey,
  target,
  elapsedMinutes: Number(((Date.now() - startedAt) / 60_000).toFixed(2)),
});
