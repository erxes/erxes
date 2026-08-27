import * as dotenv from 'dotenv';
import {
  normalizeSegmentOperator,
  SegmentOperator,
} from 'erxes-api-shared/core-modules';
import { MongoClient } from 'mongodb';
import type { SegmentNode, SegmentValue } from 'erxes-api-shared/core-modules';

/**
 * Rewrites `segments` from the flat condition list into one tree per segment.
 *
 * Two passes, so the conversion can be re-run against an unchanging source:
 *   1. copy `segments` -> `segments_backup` untouched (rollback lives here)
 *   2. read `segments_backup`, convert, replace the contents of `segments`
 *
 * Nothing reads the new shape yet - run this only once the query path is
 * ported. Reports what it would do and writes nothing without `--commit`.
 *
 *   ts-node migrateSegmentsToTree.ts --owner-id=<userId> [--commit] [--refresh-backup]
 */

dotenv.config();

const { MONGO_URL } = process.env;

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

const COMMIT = hasFlag('--commit');
const REFRESH_BACKUP = hasFlag('--refresh-backup');
const OWNER_ID = getArg('--owner-id');

if (!OWNER_ID) {
  throw new Error(
    'Pass --owner-id=<userId>. Every segment needs a real owner before private ' +
      'and team visibility mean anything; seeding a placeholder hides that.',
  );
}

const SOURCE = 'segments';
const BACKUP = 'segments_backup';

/** Condition-level keys that were really hidden filters. See report below. */
const CONFIG_FIELD_KEYS = ['boardId', 'pipelineId', 'formId'] as const;

const NUMBER_OPERATORS = new Set<string>([
  SegmentOperator.NumberGt,
  SegmentOperator.NumberLt,
  SegmentOperator.NumberEquals,
  SegmentOperator.NumberNotEquals,
  SegmentOperator.MinutesFromNow,
  SegmentOperator.MinutesAgo,
  SegmentOperator.DaysFromNow,
  SegmentOperator.DaysAgo,
]);

const DATE_OPERATORS = new Set<string>([
  SegmentOperator.DateGte,
  SegmentOperator.DateLte,
  SegmentOperator.DateRelativeLt,
  SegmentOperator.DateRelativeGt,
]);

const VALUELESS_OPERATORS = new Set<string>([
  SegmentOperator.IsSet,
  SegmentOperator.IsNotSet,
  SegmentOperator.DateIsSet,
  SegmentOperator.DateIsNotSet,
  SegmentOperator.IsTrue,
  SegmentOperator.IsFalse,
]);

type LegacyCondition = {
  type?: string;
  propertyType?: string;
  propertyName?: string;
  propertyOperator?: string;
  propertyValue?: unknown;
  subSegmentId?: string;
  config?: Record<string, unknown>;
};

type LegacySegment = {
  _id: string;
  contentType?: string;
  name?: string;
  description?: string;
  color?: string;
  subOf?: string;
  conditions?: LegacyCondition[];
  conditionsConjunction?: string;
  config?: Record<string, unknown>;
};

const report = {
  roots: 0,
  droppedDanglingSubSegment: 0,
  droppedDanglingSubOf: 0,
  droppedEvent: 0,
  droppedUnusable: 0,
  emptiedSegment: 0,
  salvagedUntyped: 0,
  fieldNodes: 0,
  configNodes: 0,
  normalizedOperators: 0,
  coercedNumbers: 0,
  coercedDates: 0,
  cycles: 0,
};

const coerceValue = (
  operator: string,
  raw: unknown,
): SegmentValue | undefined => {
  if (VALUELESS_OPERATORS.has(operator)) {
    return undefined;
  }

  if (raw === undefined || raw === null || raw === '') {
    return undefined;
  }

  if (Array.isArray(raw)) {
    return raw.map((item) => String(item));
  }

  if (NUMBER_OPERATORS.has(operator)) {
    const parsed = Number(String(raw).replace(/,/g, ''));

    if (!Number.isNaN(parsed)) {
      report.coercedNumbers++;
      return parsed;
    }
  }

  if (DATE_OPERATORS.has(operator)) {
    const parsed = new Date(String(raw));

    if (!Number.isNaN(parsed.getTime())) {
      report.coercedDates++;
      return parsed;
    }
  }

  if (typeof raw === 'boolean' || typeof raw === 'number') {
    return raw;
  }

  return String(raw);
};

/**
 * `config.boardId` and friends silently added a `stageId IN (...)` clause to
 * the generated query, so they were conditions in everything but name. They
 * become ordinary sibling nodes, deduplicated within their group.
 */
const configNodes = (
  config: Record<string, unknown> | undefined,
  contentType: string,
  seen: Set<string>,
): SegmentNode[] => {
  const nodes: SegmentNode[] = [];

  for (const key of CONFIG_FIELD_KEYS) {
    const value = config?.[key];

    if (typeof value !== 'string' || !value) {
      continue;
    }

    const dedupeKey = `${key}:${value}`;

    if (seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);
    report.configNodes++;
    nodes.push({
      kind: 'field',
      contentType,
      fieldKey: key,
      operator: SegmentOperator.Equals,
      value,
    });
  }

  return nodes;
};

const conditionNode = (
  condition: LegacyCondition,
  ownerContentType: string,
): SegmentNode | null => {
  const rawOperator = condition.propertyOperator;

  if (!condition.propertyName || !rawOperator) {
    return null;
  }

  if (!condition.type) {
    report.salvagedUntyped++;
  }

  const operator = normalizeSegmentOperator(rawOperator as SegmentOperator);

  if (operator !== rawOperator) {
    report.normalizedOperators++;
  }

  report.fieldNodes++;

  return {
    kind: 'field',
    contentType: condition.propertyType || ownerContentType,
    fieldKey: condition.propertyName,
    operator,
    value: coerceValue(operator, condition.propertyValue),
  };
};

const buildOwnTree = (
  segment: LegacySegment,
  byId: Map<string, LegacySegment>,
  visiting: Set<string>,
  /**
   * Config keys an `and`-joined ancestor already enforces. The old shape copied
   * `config` onto a segment and every one of its sub-segments, so without this
   * the same "Board = X" row would show up at every level of the tree.
   */
  inheritedConfig: Set<string>,
): SegmentNode | null => {
  const ownerContentType = segment.contentType || '';
  const children: SegmentNode[] = [];
  const seenConfig = new Set<string>(inheritedConfig);
  const conjunction = segment.conditionsConjunction === 'or' ? 'or' : 'and';

  children.push(...configNodes(segment.config, ownerContentType, seenConfig));

  for (const condition of segment.conditions || []) {
    if (condition.subSegmentId) {
      const child = byId.get(condition.subSegmentId);

      if (!child) {
        report.droppedDanglingSubSegment++;
        continue;
      }

      const childTree = buildTree(
        child,
        byId,
        visiting,
        conjunction === 'and' ? seenConfig : inheritedConfig,
      );

      if (childTree) {
        children.push(childTree);
      }

      continue;
    }

    if (condition.propertyName) {
      children.push(
        ...configNodes(condition.config, ownerContentType, seenConfig),
      );

      const node = conditionNode(condition, ownerContentType);

      if (node) {
        children.push(node);
      } else {
        report.droppedUnusable++;
      }

      continue;
    }

    if (condition.type === 'event') {
      report.droppedEvent++;
      continue;
    }

    report.droppedUnusable++;
  }

  if (!children.length) {
    return null;
  }

  return { kind: 'group', conjunction, children };
};

/** A segment's own conditions, intersected with its `subOf` ancestor's tree. */
const buildTree = (
  segment: LegacySegment,
  byId: Map<string, LegacySegment>,
  visiting: Set<string>,
  inheritedConfig: Set<string> = new Set(),
): SegmentNode | null => {
  if (visiting.has(segment._id)) {
    report.cycles++;
    return null;
  }

  visiting.add(segment._id);

  try {
    const own = buildOwnTree(segment, byId, visiting, inheritedConfig);

    if (!segment.subOf) {
      return own;
    }

    const parent = byId.get(segment.subOf);

    if (!parent) {
      report.droppedDanglingSubOf++;
      return own;
    }

    const parentTree = buildTree(parent, byId, visiting, inheritedConfig);

    if (!parentTree) {
      return own;
    }

    if (!own) {
      return parentTree;
    }

    return { kind: 'group', conjunction: 'and', children: [parentTree, own] };
  } finally {
    visiting.delete(segment._id);
  }
};

const migrateSegmentsToTree = async () => {
  const client = new MongoClient(MONGO_URL);

  try {
    await client.connect();

    const db = client.db();
    const source = db.collection<LegacySegment>(SOURCE);
    const backup = db.collection<LegacySegment>(BACKUP);

    const backupCount = await backup.countDocuments();

    if (backupCount === 0 || REFRESH_BACKUP) {
      const sourceCount = await source.countDocuments();

      if (!COMMIT) {
        console.info(
          `[1/2] would copy ${sourceCount} documents ${SOURCE} -> ${BACKUP}`,
        );
      } else {
        await backup.deleteMany({});
        await source.aggregate([{ $out: BACKUP }]).toArray();
        console.info(`[1/2] copied ${sourceCount} documents to ${BACKUP}`);
      }
    } else {
      console.info(
        `[1/2] ${BACKUP} already holds ${backupCount} documents; reading from it. ` +
          'Pass --refresh-backup to replace it.',
      );
    }

    const legacy = await (backupCount === 0 && !COMMIT ? source : backup)
      .find({})
      .toArray();

    const byId = new Map(legacy.map((segment) => [segment._id, segment]));
    const roots = legacy.filter((segment) => Boolean(segment.name));
    const sourceConditions = legacy.reduce(
      (total, segment) =>
        total +
        (segment.conditions || []).filter((c) => Boolean(c.propertyName))
          .length,
      0,
    );

    const migrated = roots.map((segment) => {
      const root: SegmentNode = buildTree(segment, byId, new Set()) || {
        kind: 'group',
        conjunction: 'and',
        children: [],
      };

      // A segment whose every condition pointed at a deleted sub-segment keeps
      // its identity and comes back as a draft. Deleting it would take away a
      // saved segment the user can still see today.
      const emptied = root.kind === 'group' && !root.children.length;

      if (emptied) {
        report.emptiedSegment++;
      }

      report.roots++;

      return {
        _id: segment._id,
        contentType: segment.contentType || '',
        name: segment.name as string,
        description: segment.description,
        color: segment.color,
        root,
        visibility: 'organization' as const,
        ownerId: OWNER_ID,
        executionMode: 'dynamic' as const,
        status: emptied ? ('draft' as const) : ('active' as const),
        revision: 1,
        createdBy: OWNER_ID,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    console.info(`\n  source documents            ${legacy.length}`);
    console.info(`  named segments              ${roots.length}`);
    console.info(`  migrated                    ${migrated.length}`);
    console.info(`  emptied -> kept as draft      ${report.emptiedSegment}`);
    console.info(`\n  source conditions           ${sourceConditions}`);
    console.info(`  field nodes emitted         ${report.fieldNodes}`);
    console.info(
      `\n  dangling subSegmentId       ${report.droppedDanglingSubSegment}`,
    );
    console.info(
      `  dangling subOf              ${report.droppedDanglingSubOf}`,
    );
    console.info(`  event conditions dropped    ${report.droppedEvent}`);
    console.info(`  unusable conditions dropped ${report.droppedUnusable}`);
    console.info(`  untyped conditions kept     ${report.salvagedUntyped}`);
    console.info(`  cycles broken               ${report.cycles}`);
    console.info(`\n  config promoted to nodes    ${report.configNodes}`);
    console.info(`  operators normalized        ${report.normalizedOperators}`);
    console.info(`  values coerced to number    ${report.coercedNumbers}`);
    console.info(`  values coerced to date      ${report.coercedDates}`);

    if (!COMMIT) {
      console.info(
        `\n[2/2] dry run - nothing written. Re-run with --commit to replace ${SOURCE}.`,
      );
      return;
    }

    await source.deleteMany({});

    if (migrated.length) {
      await source.insertMany(migrated as never[], { ordered: false });
    }

    console.info(`\n[2/2] replaced ${SOURCE} with ${migrated.length} segments`);
  } finally {
    await client.close();
  }
};

migrateSegmentsToTree()
  .catch((error: unknown) => {
    console.error('Segment tree migration failed', error);
    process.exitCode = 1;
  })
  .finally(() => {
    // erxes-api-shared opens shared clients when it is imported, so the event
    // loop never drains on its own and the script would hang after finishing.
    process.exit(process.exitCode ?? 0);
  });
