import type { LeadRecordType, LeadReport } from '@erxes/core-contract';
import { type Db, leadEvents, leadStages } from '@erxes/core-db';
import type { LEAD_EVENTS } from '@erxes/core-db/enums';
import { type SQL, sql } from 'drizzle-orm';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { leadCounts, recordTable, stagesOf } from './stages';

type LeadEventName = (typeof LEAD_EVENTS)[number];

/** The events that start a record's time in the funnel. */
const ENTERED: LeadEventName[] = ['created', 'reopened'];

/** The events a record can be disqualified by. */
const MOVED: LeadEventName[] = [...ENTERED, 'stage'];

/** Postgres answers `numeric` (averages, percentiles) as strings. */
const Count = z.coerce.number().int();

/** Days to one decimal, or null when there was nothing to average. */
const Days = z.coerce
  .number()
  .nullable()
  .transform((value) => (value === null ? null : Math.round(value * 10) / 10));

const rowsOf = async <T extends z.ZodType>(client: Db, row: T, query: SQL) =>
  z.array(row).parse((await client.execute(query)).rows);

/** The report's period and the SQL that picks one record type's lead events. */
interface Scope {
  client: Db;
  type: LeadRecordType;
  table: ReturnType<typeof recordTable>;
  /** `customer_id` or `company_id` on `core_lead_events`. */
  col: SQL;
  from: Date;
  to: Date;
  inPeriod: SQL;
}

const Totals = z.object({
  created: Count,
  converted: Count,
  disqualified: Count,
  cohort_converted: Count,
  median: Days,
  average: Days,
});

/** Leads made, converted and lost in the period, and how long converting took. */
const totalsOf = async ({ client, table, col, inPeriod }: Scope) => {
  const [totals] = await rowsOf(
    client,
    Totals,
    sql`
      with period as (select e.* from ${leadEvents} e where e.${col} is not null and ${inPeriod}),
      cohort as (select c.converted_at from period e join ${table} c on c.id = e.${col} where e.event = 'created'),
      conversions as (
        select extract(epoch from (e.created_at - coalesce(
          (select min(x.created_at) from ${leadEvents} x where x.${col} = e.${col} and x.event in ${ENTERED} and x.created_at <= e.created_at),
          e.created_at))) / 86400 as days
        from period e where e.event = 'converted'
      )
      select
        (select count(*) from cohort)::int as created,
        (select count(*) from period where event = 'converted')::int as converted,
        (select count(distinct e.${col}) from period e join ${leadStages} s on s.id = e.to_stage_id where s.kind = 'disqualified' and e.event in ${MOVED})::int as disqualified,
        (select count(*) from cohort where converted_at is not null)::int as cohort_converted,
        (select percentile_cont(0.5) within group (order by days) from conversions) as median,
        (select avg(days) from conversions) as average
    `,
  );

  return totals;
};

/** Each stint in a stage: from the event that put the lead there to the next one (or now, while still there). */
const stintsOf = async ({ client, col, from, to }: Scope) => {
  const rows = await rowsOf(
    client,
    z.object({ stage_id: z.string(), reached: Count, average_days: Days }),
    sql`
      with stints as (
        select e.${col} as record_id, e.to_stage_id, e.created_at,
          lead(e.created_at) over (partition by e.${col} order by e.created_at, e.id) as left_at
        from ${leadEvents} e where e.${col} is not null and e.to_stage_id is not null
      )
      select to_stage_id as stage_id,
        count(distinct record_id) filter (where created_at >= ${from.toISOString()}::timestamptz and created_at < ${to.toISOString()}::timestamptz)::int as reached,
        avg(extract(epoch from (left_at - created_at)) / 86400) filter (where left_at >= ${from.toISOString()}::timestamptz and left_at < ${to.toISOString()}::timestamptz) as average_days
      from stints group by to_stage_id
    `,
  );

  return new Map(rows.map((row) => [row.stage_id, row]));
};

/** The period's leads by a column of the record (source, owner), and how many converted. */
const cohortBy = ({ client, table, col, inPeriod }: Scope, column: 'source' | 'owner_id') =>
  rowsOf(
    client,
    z.object({ key: z.string().nullable(), count: Count, converted: Count }),
    sql`
      select c.${sql.raw(column)} as key, count(*)::int as count, count(c.converted_at)::int as converted
      from ${leadEvents} e join ${table} c on c.id = e.${col}
      where e.event = 'created' and e.${col} is not null and ${inPeriod}
      group by 1 order by 2 desc limit 20
    `,
  );

/** Why leads were disqualified in the period, most common first. */
const reasonsOf = ({ client, col, inPeriod }: Scope) =>
  rowsOf(
    client,
    z.object({ reason: z.string(), count: Count }),
    sql`
      select e.reason, count(*)::int as count
      from ${leadEvents} e join ${leadStages} s on s.id = e.to_stage_id
      where e.${col} is not null and s.kind = 'disqualified' and e.reason is not null and ${inPeriod}
      group by 1 order by 2 desc limit 10
    `,
  );

const scopeOf = (
  client: Db,
  input: { recordType?: LeadRecordType; from?: string; to?: string },
): Scope => {
  const type = input.recordType ?? 'customer';
  const to = input.to ? new Date(input.to) : new Date();
  const from = input.from ? new Date(input.from) : new Date(to.getTime() - 30 * 86_400_000);

  if (from >= to)
    throw fail('INVALID_INPUT', '`from` must be before `to`', {
      issues: [{ path: ['from'], message: '`from` must be before `to`' }],
    });

  return {
    client,
    type,
    table: recordTable(type),
    col: sql.raw(type === 'company' ? 'company_id' : 'customer_id'),
    from,
    to,
    inPeriod: sql`e.created_at >= ${from.toISOString()}::timestamptz and e.created_at < ${to.toISOString()}::timestamptz`,
  };
};

/**
 * The funnel for a period: leads made, converted and lost; the period's leads
 * by source and owner (cohort: what became of them); every stage with who is
 * in it now, who reached it and the average stay; why leads were lost.
 */
export const leadReport = async (
  client: Db,
  input: { recordType?: LeadRecordType; from?: string; to?: string },
): Promise<LeadReport> => {
  const scope = scopeOf(client, input);
  const stages = await stagesOf(client);
  const counts = await leadCounts(client, scope.type);
  const totals = await totalsOf(scope);
  const stints = await stintsOf(scope);
  const sources = await cohortBy(scope, 'source');
  const owners = await cohortBy(scope, 'owner_id');
  const created = totals?.created ?? 0;

  return {
    recordType: scope.type,
    from: scope.from.toISOString(),
    to: scope.to.toISOString(),
    created,
    converted: totals?.converted ?? 0,
    disqualified: totals?.disqualified ?? 0,
    conversionRate: created ? (totals?.cohort_converted ?? 0) / created : 0,
    daysToConvert: { median: totals?.median ?? null, average: totals?.average ?? null },
    stages: stages.map((stage) => ({
      stageId: stage.id,
      name: stage.name,
      kind: stage.kind,
      color: stage.color,
      current: counts.get(stage.id) ?? 0,
      reached: stints.get(stage.id)?.reached ?? 0,
      averageDays: stints.get(stage.id)?.average_days ?? null,
    })),
    bySource: sources.map(({ key, ...row }) => ({ source: key, ...row })),
    byOwner: owners.map(({ key, ...row }) => ({ ownerId: key, ...row })),
    reasons: await reasonsOf(scope),
  };
};
