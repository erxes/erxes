import * as dotenv from 'dotenv';
import Redis from 'ioredis';
import { MongoClient } from 'mongodb';
import { SegmentOperator } from 'erxes-api-shared/core-modules';
import type { SegmentNode } from 'erxes-api-shared/core-modules';

/**
 * Checks that a segment definition still decides an automation. Seeds a
 * throwaway customer plus a segment and automation per case, fires a trigger
 * at the running automations service, and reads the verdict back from
 * `automations_executions`. Cleans up after itself.
 *
 *   npx tsx backend/core-api/src/commands/testSegmentAutomation.ts \
 *     --owner-id=<userId> [--subdomain=os] [--only=field-match,or-mixed]
 *     [--include-slow] [--keep] [--cleanup-only] [--automations-url=<url>]
 */

dotenv.config();

const { MONGO_URL, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, SEGMENT_TIME_ZONE } =
  process.env;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL not set.');
}

const args = process.argv.slice(2);
const hasFlag = (flag: string) => args.includes(flag);
const getArg = (name: string) =>
  args
    .find((arg) => arg.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');

const SUBDOMAIN = getArg('--subdomain') || 'os';
const OWNER_ID = getArg('--owner-id');
const AUTOMATIONS_URL = getArg('--automations-url');
const ONLY = (getArg('--only') || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const INCLUDE_SLOW = hasFlag('--include-slow');
const KEEP = hasFlag('--keep');
const CLEANUP_ONLY = hasFlag('--cleanup-only');

if (!OWNER_ID && !CLEANUP_ONLY) {
  throw new Error(
    'Pass --owner-id=<userId>. A segment needs a real owner, and one that ' +
      'does not exist would make every case fail for the wrong reason.',
  );
}

const MARKER = 'segtest';
const CUSTOMER_TYPE = 'core:contacts.customers';

const runId = Math.random().toString(36).slice(2, 8);
const probeId = `${MARKER}-${runId}-customer`;

type Expected = 'matched' | 'notMatched' | 'error';

type Outcome = Expected | 'skipped' | 'failed';

type Case = {
  key: string;
  label: string;
  expect: Expected;
  root: SegmentNode;
  needs?: string;
  slow?: boolean;
  noSegment?: boolean;
};

const group = (
  conjunction: 'and' | 'or',
  children: SegmentNode[],
): SegmentNode => ({ kind: 'group', conjunction, children });

const field = (
  fieldKey: string,
  operator: SegmentOperator,
  value?: string | number | boolean | Date | string[],
  contentType = CUSTOMER_TYPE,
): SegmentNode => ({ kind: 'field', contentType, fieldKey, operator, value });

const resolveTimeZone = async (
  configs: ReturnType<ReturnType<MongoClient['db']>['collection']>,
): Promise<string> => {
  const doc = await configs.findOne({ code: 'TIMEZONE' });
  const configured = typeof doc?.value === 'string' ? doc.value.trim() : '';
  const value = configured || SEGMENT_TIME_ZONE || 'UTC';

  try {
    Intl.DateTimeFormat('en-US', { timeZone: value });
    return value;
  } catch {
    console.warn(`unknown time zone "${value}", falling back to UTC`);
    return 'UTC';
  }
};

const zonedParts = (instant: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant);

  const read = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
  };
};

const instantOnZonedDay = (
  year: number,
  month: number,
  day: number,
  timeZone: string,
): Date => {
  let guess = Date.UTC(year, month - 1, day, 12, 0, 0);

  for (let attempt = 0; attempt < 3; attempt++) {
    const on = zonedParts(new Date(guess), timeZone);

    if (on.year === year && on.month === month && on.day === day) {
      return new Date(guess);
    }

    guess += (12 - on.hour) * 3_600_000;
  }

  return new Date(guess);
};

const segmentIdFor = (key: string) => `${MARKER}-${runId}-${key}`;
const automationIdFor = (key: string) => `${MARKER}-${runId}-${key}-a`;

const buildCases = (probeEmail: string): Case[] => {
  const matches = field('primaryEmail', SegmentOperator.Equals, probeEmail);
  const misses = field(
    'primaryEmail',
    SegmentOperator.Equals,
    'nobody@example.invalid',
  );
  const scored = field('score', SegmentOperator.NumberGt, 10);

  return [
    {
      key: 'field-match',
      label: 'primaryEmail equals the probe',
      expect: 'matched',
      root: group('and', [matches]),
    },
    {
      key: 'field-miss',
      label: 'primaryEmail equals someone else',
      expect: 'notMatched',
      root: group('and', [misses]),
    },
    {
      key: 'field-contains',
      label: 'firstName contains a fragment',
      expect: 'matched',
      root: group('and', [
        field('firstName', SegmentOperator.Contains, 'egmen'),
      ]),
    },
    {
      key: 'field-isset',
      label: 'code is set',
      expect: 'matched',
      root: group('and', [field('code', SegmentOperator.IsSet)]),
    },
    {
      key: 'field-unset',
      label: 'department is not set',
      expect: 'matched',
      root: group('and', [field('department', SegmentOperator.IsNotSet)]),
    },
    {
      key: 'number-gt',
      label: 'score is above 10',
      expect: 'matched',
      root: group('and', [scored]),
    },
    {
      key: 'number-lt',
      label: 'score is below 10',
      expect: 'notMatched',
      root: group('and', [field('score', SegmentOperator.NumberLt, 10)]),
    },
    {
      key: 'boolean-true',
      label: 'isSubscribed is true',
      expect: 'matched',
      root: group('and', [field('isSubscribed', SegmentOperator.IsTrue)]),
    },
    {
      key: 'and-both',
      label: 'AND of two conditions that both hold',
      expect: 'matched',
      root: group('and', [matches, scored]),
    },
    {
      key: 'and-mixed',
      label: 'AND where one condition fails',
      expect: 'notMatched',
      root: group('and', [matches, misses]),
    },
    {
      key: 'or-mixed',
      label: 'OR where one condition holds',
      expect: 'matched',
      root: group('or', [misses, matches]),
    },
    {
      key: 'nested',
      label: 'AND containing a nested OR',
      expect: 'matched',
      root: group('and', [matches, group('or', [misses, scored])]),
    },
    {
      key: 'anniversary-today',
      label: 'birthday is today',
      expect: 'matched',
      root: group('and', [
        field('birthDate', SegmentOperator.AnniversaryToday),
      ]),
    },
    {
      key: 'anniversary-ahead',
      label: 'birthday is in 3 days',
      expect: 'notMatched',
      root: group('and', [
        field('birthDate', SegmentOperator.AnniversaryFromNow, 3),
      ]),
    },
    {
      key: 'relation-none',
      label: 'has no deals',
      expect: 'matched',
      needs: 'sales',
      root: group('and', [
        {
          kind: 'relation',
          relationKey: 'customer.deals',
          measure: { op: 'none' },
        },
      ]),
    },
    {
      key: 'relation-exists',
      label: 'has at least one deal',
      expect: 'notMatched',
      needs: 'sales',
      root: group('and', [
        {
          kind: 'relation',
          relationKey: 'customer.deals',
          measure: { op: 'exists' },
        },
      ]),
    },
    {
      key: 'segment-ref',
      label: 'is a member of another segment',
      expect: 'matched',
      root: group('and', [
        { kind: 'segment', segmentId: segmentIdFor('field-match') },
      ]),
    },
    {
      key: 'segment-ref-exclude',
      label: 'is outside another segment',
      expect: 'notMatched',
      root: group('and', [
        {
          kind: 'segment',
          segmentId: segmentIdFor('field-match'),
          exclude: true,
        },
      ]),
    },
    {
      key: 'missing-segment',
      label: 'trigger points at a segment that does not exist',
      expect: 'notMatched',
      noSegment: true,
      root: group('and', [matches]),
    },
    {
      key: 'plugin-unavailable',
      label: 'reads a content type no plugin answers for',
      expect: 'error',
      slow: true,
      root: group('and', [
        field('anything', SegmentOperator.Equals, 'x', 'nosuch:thing.things'),
      ]),
    },
  ];
};

const discover = async (): Promise<{
  automations: string;
  core: string;
  plugins: Set<string>;
}> => {
  const enabled = new Set(
    (process.env.ENABLED_PLUGINS || '')
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean),
  );

  const redis = new Redis({
    host: REDIS_HOST,
    port: Number.parseInt(REDIS_PORT || '6379', 10),
    password: REDIS_PASSWORD,
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });

  let automations = AUTOMATIONS_URL || '';
  let core = '';
  const plugins = new Set<string>();

  try {
    await redis.connect();

    if (!automations) {
      automations = (await redis.get('erxes-service-automations')) || '';
    }

    core = (await redis.get('erxes-service-core')) || '';

    for (const name of enabled) {
      if (await redis.get(`erxes-service-${name}`)) {
        plugins.add(name);
      }
    }
  } catch {
    // Without redis the usual ports still work, and a case needing a plugin
    // reports as skipped rather than failing.
  } finally {
    redis.disconnect();
  }

  return {
    automations: automations || 'http://localhost:3302',
    core: core || 'http://localhost:3300',
    plugins,
  };
};

const reachable = async (address: string): Promise<boolean> => {
  try {
    const response = await fetch(`${address}/health`, {
      signal: AbortSignal.timeout(5_000),
    });

    return response.ok;
  } catch {
    return false;
  }
};

const fireTrigger = async (address: string, targetId: string) => {
  const context = Buffer.from(
    JSON.stringify({ subdomain: SUBDOMAIN, method: 'mutation' }),
  ).toString('base64');

  const response = await fetch(`${address}/trpc/automations.trigger`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-trpc-context': context,
    },
    body: JSON.stringify({
      type: CUSTOMER_TYPE,
      targets: [{ _id: targetId }],
      recordType: 'existing',
    }),
  });

  if (!response.ok) {
    throw new Error(
      `automations answered ${response.status}: ${await response.text()}`,
    );
  }
};

const testSegmentAutomation = async () => {
  const client = new MongoClient(MONGO_URL);

  try {
    await client.connect();

    const db = client.db();
    const segments = db.collection('segments');
    const automations = db.collection('automations');
    const executions = db.collection('automations_executions');
    const customers = db.collection('customers');

    if (CLEANUP_ONLY) {
      const stale = await automations
        .find(
          { name: { $regex: `^\\[${MARKER} ` } },
          { projection: { _id: 1 } },
        )
        .toArray();

      const removed = {
        executions: (
          await executions.deleteMany({
            automationId: { $in: stale.map((doc) => String(doc._id)) },
          })
        ).deletedCount,
        automations: (
          await automations.deleteMany({ name: { $regex: `^\\[${MARKER} ` } })
        ).deletedCount,
        segments: (
          await segments.deleteMany({ name: { $regex: `^\\[${MARKER} ` } })
        ).deletedCount,
        customers: (
          await customers.deleteMany({
            _id: { $regex: `^${MARKER}-` } as never,
          })
        ).deletedCount,
      };

      console.info(
        `removed ${removed.segments} segments, ${removed.automations} automations, ` +
          `${removed.executions} executions, ${removed.customers} customers`,
      );

      return;
    }

    const timeZone = await resolveTimeZone(db.collection('configs'));
    const today = zonedParts(new Date(), timeZone);
    const { automations: address, core, plugins } = await discover();

    console.info(
      `run ${runId} | subdomain ${SUBDOMAIN} | zone ${timeZone} ` +
        `(today ${today.year}-${today.month}-${today.day}) | ${address}`,
    );

    if (!(await reachable(address))) {
      console.error(
        `\nThe automations service did not answer at ${address}.\n` +
          'Start it with "pnpm nx serve automations-service", or pass ' +
          '--automations-url=<address> if it runs somewhere else.',
      );
      process.exitCode = 1;
      return;
    }

    if (!(await reachable(core))) {
      console.error(
        `\nCore did not answer at ${core}.\n` +
          'Every case would report "did not match" without it, because a ' +
          'segment that cannot be loaded is read as one that does not exist.\n' +
          'Start it with "pnpm dev:core-api".',
      );
      process.exitCode = 1;
      return;
    }

    const birthDate = instantOnZonedDay(1990, today.month, today.day, timeZone);
    const probeEmail = `${MARKER}-${runId}@example.invalid`;

    await customers.insertOne({
      _id: probeId as never,
      state: 'customer',
      status: 'Active',
      firstName: 'Segment',
      lastName: 'Probe',
      primaryEmail: probeEmail,
      emails: [probeEmail],
      code: `${MARKER}-${runId}`,
      score: 42,
      isSubscribed: true,
      birthDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const cases = buildCases(probeEmail)
      .map((testCase) => ({
        ...testCase,
        segmentId: segmentIdFor(testCase.key),
        automationId: automationIdFor(testCase.key),
      }))
      .filter((testCase) => (INCLUDE_SLOW ? true : !testCase.slow))
      .filter((testCase) => (ONLY.length ? ONLY.includes(testCase.key) : true));

    if (!cases.length) {
      console.info('no cases selected');
      return;
    }

    const seeded = cases.filter((testCase) => !testCase.noSegment);

    await segments.insertMany(
      seeded.map((testCase) => ({
        _id: testCase.segmentId as never,
        contentType: CUSTOMER_TYPE,
        name: `[${MARKER} ${runId}] ${testCase.key}`,
        root: testCase.root,
        dependsOn: [CUSTOMER_TYPE],
        visibility: 'organization',
        ownerId: OWNER_ID,
        status: 'active',
        revision: 1,
        createdBy: OWNER_ID,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );

    await automations.insertMany(
      cases.map((testCase) => ({
        _id: testCase.automationId as never,
        name: `[${MARKER} ${runId}] ${testCase.key}`,
        status: 'active',
        triggers: [
          {
            id: `${testCase.automationId}-t`,
            type: CUSTOMER_TYPE,
            config: { contentId: testCase.segmentId, recordType: 'every' },
          },
        ],
        actions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: OWNER_ID,
      })),
    );

    await customers.updateOne(
      { _id: probeId as never },
      { $set: { segmentIds: [segmentIdFor('field-match')] } },
    );

    const results: {
      key: string;
      label: string;
      expect: Expected;
      got: Outcome;
      note: string;
      ok: boolean;
    }[] = [];

    for (const testCase of cases) {
      let got: Outcome = 'failed';
      let note = '';

      if (testCase.needs && !plugins.has(testCase.needs)) {
        results.push({
          key: testCase.key,
          label: testCase.label,
          expect: testCase.expect,
          got: 'skipped',
          note: `${testCase.needs} is not running`,
          ok: true,
        });

        console.info(
          `skip  ${testCase.key.padEnd(20)} ${testCase.needs} is not running`,
        );

        continue;
      }

      try {
        await fireTrigger(address, probeId);

        const execution = await executions.findOne({
          automationId: testCase.automationId,
        });

        if (!execution) {
          got = 'notMatched';
        } else if (execution.status === 'error') {
          got = 'error';
          note = String(execution.description || '').slice(0, 90);
        } else {
          got = 'matched';
        }
      } catch (error: unknown) {
        note = error instanceof Error ? error.message : String(error);
      }

      const ok = got === testCase.expect;

      results.push({
        key: testCase.key,
        label: testCase.label,
        expect: testCase.expect,
        got,
        note: note || (testCase.needs ? `needs ${testCase.needs}` : ''),
        ok,
      });

      console.info(
        `${ok ? 'ok  ' : 'FAIL'}  ${testCase.key.padEnd(20)} ` +
          `expected ${testCase.expect.padEnd(10)} got ${String(got).padEnd(
            10,
          )} ` +
          `${note}`,
      );
    }

    const failed = results.filter((result) => !result.ok);
    const skipped = results.filter((result) => result.got === 'skipped');
    const ran = results.length - skipped.length;

    console.info(
      `\n${ran - failed.length}/${ran} cases behaved as expected` +
        (skipped.length ? `, ${skipped.length} skipped` : ''),
    );

    if (failed.length) {
      console.info(
        'failed: ' +
          failed.map((result) => `${result.key} (${result.label})`).join(', '),
      );
      process.exitCode = 1;
    }

    if (KEEP) {
      console.info(
        `\nkept run ${runId}. Remove it with --cleanup-only when finished.`,
      );
      return;
    }

    await executions.deleteMany({
      automationId: { $in: cases.map((testCase) => testCase.automationId) },
    });
    await automations.deleteMany({
      _id: { $in: cases.map((testCase) => testCase.automationId) } as never,
    });
    await segments.deleteMany({
      _id: { $in: seeded.map((testCase) => testCase.segmentId) } as never,
    });
    await customers.deleteOne({ _id: probeId as never });
  } finally {
    await client.close();
  }
};

testSegmentAutomation()
  .catch((error: unknown) => {
    console.error('Segment automation probe failed', error);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit(process.exitCode ?? 0);
  });
