import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import type { AnyBulkWriteOperation, Collection, Db } from 'mongodb';

dotenv.config();

const {
  MONGO_URL = 'mongodb://127.0.0.1:27017/erxes?directConnection=true',
  BATCH_SIZE = '1000',
  LOYALTY_TIME_ZONE = 'Asia/Ulaanbaatar',
} = process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

type OldRepeatValue = { label?: string; value?: string };

type OldRepeatRule = {
  type?: string;
  dayStartValue?: Date | string;
  dayEndValue?: Date | string;
  weekValue?: OldRepeatValue[];
  monthValue?: OldRepeatValue[];
  yearStartValue?: Date | string;
  yearEndValue?: Date | string;
};

type WindowType = 'daily' | 'weekly' | 'monthly' | 'yearly';

type ActiveWindow = {
  type: WindowType;
  startTime: string;
  endTime: string;
  weekDays?: number[];
  monthDays?: number[];
  fromMonthDay?: string;
  toMonthDay?: string;
};

type PricingDocument = {
  _id: string;
  name?: string;
  priority?: string | null;
  repeatRules?: OldRepeatRule[];
  activeWindows?: ActiveWindow[];
} & Record<string, unknown>;

const client = new MongoClient(MONGO_URL);

let db: Db;
let Pricings: Collection<PricingDocument>;

const batchSize = Math.max(Number(BATCH_SIZE) || 1000, 1);

const pad = (value: number) => String(value).padStart(2, '0');

const toDate = (value?: Date | string) => {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
};

// The old form saved wall-clock times as UTC.
const utcTime = (value?: Date | string) => {
  const date = toDate(value);

  return date
    ? `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
    : undefined;
};

// 'MM-DD' of a date on the organization's calendar.
const monthDay = (value?: Date | string) => {
  const date = toDate(value);

  if (!date) {
    return undefined;
  }

  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: LOYALTY_TIME_ZONE,
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );

  return `${parts.month}-${parts.day}`;
};

const DAY_RULE_TYPES: Array<[string, WindowType]> = [
  ['everyWeek', 'weekly'],
  ['everyMonth', 'monthly'],
  ['everyYear', 'yearly'],
];

// Old rules all had to hold at once, so together they describe one window.
// A window has one type; the first day rule present decides it.
const toWindow = (rules: OldRepeatRule[]) => {
  const has = (type: string) => rules.some((rule) => rule.type === type);
  const present = DAY_RULE_TYPES.filter(([oldType]) => has(oldType));
  const type: WindowType = present[0]?.[1] || 'daily';
  const droppedTypes = present.slice(1).map(([oldType]) => oldType);
  const day = rules.find((rule) => rule.type === 'everyDay');
  let skippedValues = 0;

  const numbers = (oldType: string, field: 'weekValue' | 'monthValue') => {
    const values = rules
      .filter((rule) => rule.type === oldType)
      .flatMap((rule) => rule[field] || [])
      .map((item) => Number(item.value));

    skippedValues += values.filter((value) => !Number.isInteger(value)).length;

    return [...new Set(values.filter(Number.isInteger))].sort((a, b) => a - b);
  };

  let startTime = utcTime(day?.dayStartValue) ?? '00:00';
  let endTime = utcTime(day?.dayEndValue) ?? '24:00';

  if (startTime === endTime) {
    startTime = '00:00';
    endTime = '24:00';
  }

  const window: ActiveWindow = { type, startTime, endTime };

  if (type === 'weekly') {
    window.weekDays = numbers('everyWeek', 'weekValue');
  }

  if (type === 'monthly') {
    window.monthDays = numbers('everyMonth', 'monthValue');
  }

  if (type === 'yearly') {
    const year = rules.find((rule) => rule.type === 'everyYear');

    window.fromMonthDay = monthDay(year?.yearStartValue) || '01-01';
    window.toMonthDay = monthDay(year?.yearEndValue) || '12-31';
  }

  // A day rule left without any usable day never matched; it becomes daily
  // only if nothing else limited the plan, otherwise it is reported.
  const empty =
    (type === 'weekly' && !window.weekDays?.length) ||
    (type === 'monthly' && !window.monthDays?.length);

  return { window: empty ? null : window, droppedTypes, skippedValues };
};

const flush = async (operations: AnyBulkWriteOperation<PricingDocument>[]) => {
  if (!operations.length) {
    return { modifiedCount: 0 };
  }

  return Pricings.bulkWrite(operations, { ordered: false });
};

const report = (title: string, lines: string[]) => {
  if (!lines.length) {
    return;
  }

  console.log(title);
  lines.forEach((line) => console.log(`  ${line}`));
};

const command = async () => {
  await client.connect();
  db = client.db();
  Pricings = db.collection<PricingDocument>('pricings');

  console.log(`Process start at: ${new Date().toISOString()}`);
  console.log(`Time zone: ${LOYALTY_TIME_ZONE}, batchSize: ${batchSize}`);

  const cursor = Pricings.find({
    'repeatRules.0': { $exists: true },
    $or: [
      { activeWindows: { $exists: false } },
      { activeWindows: { $size: 0 } },
    ],
  }).batchSize(batchSize);

  let scannedCount = 0;
  let modifiedCount = 0;
  const droppedTypePlans: string[] = [];
  const skippedValuePlans: string[] = [];
  const emptyPlans: string[] = [];
  const prioritizedPlans: string[] = [];
  let operations: AnyBulkWriteOperation<PricingDocument>[] = [];

  for await (const pricing of cursor) {
    scannedCount++;

    const label = `${pricing._id} (${pricing.name || 'unnamed'})`;
    const { window, droppedTypes, skippedValues } = toWindow(
      pricing.repeatRules || [],
    );

    if (droppedTypes.length) {
      droppedTypePlans.push(`${label}: ${droppedTypes.join(', ')}`);
    }

    if (skippedValues) {
      skippedValuePlans.push(label);
    }

    if (pricing.priority) {
      prioritizedPlans.push(`${label} priority=${pricing.priority}`);
    }

    if (!window) {
      emptyPlans.push(label);
      continue;
    }

    operations.push({
      updateOne: {
        filter: { _id: pricing._id },
        update: { $set: { activeWindows: [window] } },
      },
    });

    if (operations.length >= batchSize) {
      modifiedCount += (await flush(operations)).modifiedCount || 0;
      console.log(`Processed ${scannedCount}, modified ${modifiedCount}`);
      operations = [];
    }
  }

  modifiedCount += (await flush(operations)).modifiedCount || 0;

  console.log(`Scanned plans with repeat rules: ${scannedCount}`);
  console.log(`Plans given a window: ${modifiedCount}`);
  report(
    'Day rules left out (a window has one type; these were combined):',
    droppedTypePlans,
  );
  report(
    'Day values left out (such as "last day of month"), which never matched:',
    skippedValuePlans,
  );
  report(
    'Plans left without a window (no usable day); set them by hand:',
    emptyPlans,
  );
  report(
    'Scheduled plans with a priority; clear one of the two before editing:',
    prioritizedPlans,
  );
  console.log(`Process finished at: ${new Date().toISOString()}`);

  await client.close();
  process.exit();
};

command().catch(async (error) => {
  console.error(`Migration failed: ${error.message}`, error);
  await client.close();
  process.exit(1);
});
