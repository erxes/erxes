const { MongoClient } = require('mongodb');
import * as dotenv from 'dotenv';
dotenv.config();

const MONGO_URL =
  process.env.MONGO_URL ||
  'mongodb://localhost:27017/erxes?directConnection=true';

if (!MONGO_URL) {
  throw new Error('MONGO_URL not provided');
}

const DAY_MS = 24 * 60 * 60 * 1000;
const SINCE = process.env.SINCE
  ? new Date(process.env.SINCE)
  : new Date(Date.now() - 30 * DAY_MS);

if (isNaN(SINCE.getTime())) {
  throw new Error(`Invalid SINCE: ${process.env.SINCE}`);
}

const client = new MongoClient(MONGO_URL);

const isHumanAnsweredLeg = (leg: any): boolean => {
  const actionType = String(leg?.actionType ?? '');
  return (
    (leg?.disposition || '').toLowerCase() === 'answered' &&
    Number(leg?.billsec) > 0 &&
    (leg?.lastapp === 'Queue' || leg?.lastapp === 'Dial') &&
    !actionType.includes('VM')
  );
};

const deriveCallStatusFromLegs = (legs: any[]): string => {
  const actionTypeOf = (leg: any) => leg.actionType ?? '';

  if (legs.some(isHumanAnsweredLeg)) return 'ANSWERED';

  const answeredBy = (type: string) =>
    legs.some(
      (leg) =>
        actionTypeOf(leg).includes(type) &&
        (leg.disposition || '').toLowerCase() === 'answered',
    );

  if (answeredBy('IVR')) return 'IVR';
  if (answeredBy('VM')) return 'VOICEMAIL';

  if (legs.some((leg) => actionTypeOf(leg).includes('FOLLOWME'))) {
    return 'FOLLOWME';
  }

  const dispositions = legs.map((leg) => (leg.disposition || '').toUpperCase());
  if (dispositions.includes('BUSY')) return 'BUSY';
  if (dispositions.includes('FAILED')) return 'FAILED';
  if (dispositions.includes('NO ANSWER')) return 'NO ANSWER';
  return 'MISSED';
};

const buildContent = (legs: any[], userfield: string): string => {
  const direction = userfield === 'Outbound' ? 'Outbound' : 'Inbound';
  const status = deriveCallStatusFromLegs(legs);

  if (status === 'ANSWERED') return `ANSWERED · ${direction}`;
  if (direction === 'Outbound') return `OUTBOUND`;
  return `${status} · ${direction}`;
};

async function migrate() {
  await client.connect();
  const db = client.db();

  console.log(
    `Migrating call conversation contents since ${SINCE.toISOString()}`,
  );

  const Cdrs = db.collection('calls_cdrs');
  const Conversations = db.collection('conversations');

  const cursor = Cdrs.aggregate(
    [
      {
        $match: {
          conversationId: { $exists: true, $nin: [null, ''] },
          createdAt: { $gte: new Date(SINCE.getTime() - DAY_MS) },
        },
      },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: '$conversationId',
          userfield: { $last: '$userfield' },
          lastLegAt: { $max: '$createdAt' },
          legs: {
            $push: {
              disposition: '$disposition',
              actionType: '$actionType',
              lastapp: '$lastapp',
              billsec: '$billsec',
            },
          },
        },
      },
      { $match: { lastLegAt: { $gte: SINCE } } },
    ],
    { allowDiskUse: true },
  );

  let scanned = 0;
  let updated = 0;
  let batch: any[] = [];

  const flush = async () => {
    if (!batch.length) return;
    const result = await Conversations.bulkWrite(batch, { ordered: false });
    updated += result.modifiedCount;
    batch = [];
  };

  for await (const group of cursor) {
    scanned++;
    const content = buildContent(group.legs, group.userfield);

    batch.push({
      updateOne: {
        filter: { _id: group._id, content: { $ne: content } },
        update: { $set: { content } },
      },
    });

    if (batch.length >= 500) {
      await flush();
      console.log(`progress: scanned=${scanned} updated=${updated}`);
    }
  }

  await flush();

  console.log(`Migration done ✅ scanned=${scanned} updated=${updated}`);
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
