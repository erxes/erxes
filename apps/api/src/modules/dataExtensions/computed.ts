import type { Db } from '@erxes/core-db';
import { type SQL, sql } from 'drizzle-orm';
import { inOrder } from '~/lib/sequence';
import { isComputed } from './columns';
import type { ComputedValues } from './recordQueries';
import { type DataFieldRow, customKeyOf, fieldsOf, tableOf } from './definitions';
import { compileFormula, resultOf } from './formula/compile';
import { storedValue } from './formula/fieldValue';
import { FormulaError, parseFormula } from './formula/parse';
import type { Typed } from './formula/types';
import { type NativeSource, nativeSources, type NativeSources } from './nativeSources';
import { relatedRows } from './relatedRows';
import { readRelation, type RelationSide, relationSides } from './relationValues';

/**
 * Formula and rollup fields as SQL over a record's row: `{key}` reads one of its fields (a
 * stored one, its own field from core or a plugin, or another computed one), `{relation.key}`
 * a field of the one record a relation links, and a rollup sums up the records a relation
 * links. Everything is a subquery of the read, so lists filter and sort by the result.
 */

/** A record type's fields and where they are kept. */
export interface TypeModel {
  recordType: string;
  fields: DataFieldRow[];
  byKey: Map<string, DataFieldRow>;
  sides: Map<string, RelationSide>;
  table: string | null;
  native: NativeSource | null;
}

/** A record in a query: its Data Extensions row (null without one), its own-fields row, and its id. */
export interface RecordRow {
  ext: SQL | null;
  native: SQL | null;
  id: SQL;
}

/** How many formulas deep one may reach through others and relations. */
const DEPTH_MAX = 6;

export class Computer {
  private readonly models = new Map<string, Promise<TypeModel>>();
  private aliases = 0;
  /** The fields read so far (relations walked included), by id. */
  uses = new Set<string>();

  private constructor(
    private readonly client: Db,
    private readonly natives: NativeSources,
  ) {}

  static async create(client: Db) {
    return new Computer(client, await nativeSources(client));
  }

  /** A query alias no other part of the query has. */
  alias(prefix: string): SQL {
    this.aliases += 1;

    return sql`${sql.identifier(`${prefix}${this.aliases}`)}`;
  }

  model(recordType: string): Promise<TypeModel> {
    const known = this.models.get(recordType);

    if (known) return known;

    const loading = this.load(recordType);

    this.models.set(recordType, loading);

    return loading;
  }

  private async load(recordType: string): Promise<TypeModel> {
    const fields = await fieldsOf(this.client, recordType);

    const [sides, table] = await Promise.all([
      relationSides(this.client, fields),
      tableOf(this.client, recordType),
    ]);

    return {
      recordType,
      fields,
      byKey: new Map(fields.map((field) => [field.key, field])),
      sides,
      table,
      native: this.natives(recordType),
    };
  }

  /** The join that gives a record its own fields, aliased `row`, for the id `id`. */
  nativeJoin(model: TypeModel, row: SQL, id: SQL) {
    const { native } = model;

    return native?.from
      ? sql` left join ${native.from} ${row} on ${row}.${sql.identifier(native.id)} = ${id}`
      : sql``;
  }

  /** The row a record type's own query reads: own fields on its own table for custom objects. */
  nativeRow(model: TypeModel, ext: SQL, joined: SQL): SQL | null {
    if (customKeyOf(model.recordType)) return ext;

    return model.native?.from ? joined : null;
  }

  /** `{path}` on `row`'s record. */
  async read(
    model: TypeModel,
    row: RecordRow,
    path: string[],
    at: number,
    stack: string[],
  ): Promise<Typed> {
    const [key = '', ...rest] = path;
    const field = model.byKey.get(key);

    if (rest.length) return this.through(model, row, key, rest, at, stack);

    if (field) {
      this.uses.add(field.id);

      if (field.type === 'formula' || field.type === 'rollup') {
        return this.computed(model, row, field, [...stack, field.id]);
      }

      if (field.type === 'relation') {
        const side = model.sides.get(field.id);

        if (!side || side.many) {
          throw new FormulaError(`{${key}} links many records: sum them up with a rollup`, at);
        }

        const linked =
          side.holds && !row.ext ? sql`null` : readRelation(side, row.ext ?? sql`null`, row.id);

        return { sql: linked, type: 'text' };
      }

      return storedValue(field, row.ext, at);
    }

    const native = model.native?.columns.get(key);

    if (native) {
      return { sql: row.native ? native.read(row.native) : sql`null`, type: native.type };
    }

    throw new FormulaError(`{${key}} is not a field here`, at);
  }

  /** `{relation.key}`: a field of the one record a relation links. */
  private async through(
    model: TypeModel,
    row: RecordRow,
    key: string,
    rest: string[],
    at: number,
    stack: string[],
  ): Promise<Typed> {
    const field = model.byKey.get(key);
    const side = field ? model.sides.get(field.id) : undefined;

    if (!field || !side) throw new FormulaError(`{${key}} is not a relation here`, at);

    if (side.many) throw new FormulaError(`{${key}} links many records: use a rollup`, at);

    this.uses.add(field.id);

    const target = await this.model(side.relation.targetRecordType);
    const rows = relatedRows(this, side, row, target);
    const value = await this.read(target, rows.row, rest, at, stack);

    return {
      sql: sql`(select ${value.sql} from ${rows.from} where ${rows.where} limit 1)`,
      type: value.type,
    };
  }

  /** A formula or rollup field's value on `row`. */
  async computed(
    model: TypeModel,
    row: RecordRow,
    field: DataFieldRow,
    stack: string[],
  ): Promise<Typed> {
    if (stack.slice(0, -1).includes(field.id)) {
      throw new FormulaError(`{${field.key}} reads itself through other fields`, 0);
    }

    if (stack.length > DEPTH_MAX) throw new FormulaError('Formulas read each other too deep', 0);

    return this.ofSettings(model, row, field, stack);
  }

  /** What a formula or rollup's settings give on `row`. */
  async ofSettings(
    model: TypeModel,
    row: RecordRow,
    { type, settings }: Pick<DataFieldRow, 'type' | 'settings'>,
    stack: string[],
  ): Promise<Typed> {
    if (type === 'formula' && settings.formula) {
      return this.formula(model, row, settings.formula.expression, stack);
    }

    if (type === 'rollup' && settings.rollup) {
      return this.rollup(model, row, settings.rollup, stack);
    }

    throw new FormulaError(`A ${type} field needs its ${type} settings`, 0);
  }

  async formula(model: TypeModel, row: RecordRow, expression: string, stack: string[]) {
    return compileFormula(parseFormula(expression), (path, at) =>
      this.read(model, row, path, at, stack),
    );
  }

  /** A rollup over the records `rollup.relation` links to `row`'s. */
  async rollup(
    model: TypeModel,
    row: RecordRow,
    rollup: NonNullable<DataFieldRow['settings']['rollup']>,
    stack: string[],
  ): Promise<Typed> {
    const relation = model.byKey.get(rollup.relation);
    const side = relation ? model.sides.get(relation.id) : undefined;

    if (!relation || !side) throw new FormulaError(`${rollup.relation} is not a relation here`, 0);

    this.uses.add(relation.id);

    const target = await this.model(side.relation.targetRecordType);
    const rows = relatedRows(this, side, row, target);

    const value = rollup.field ? await this.read(target, rows.row, [rollup.field], 0, stack) : null;

    const where = rollup.where ? await this.formula(target, rows.row, rollup.where, stack) : null;

    if (where && where.type !== 'boolean' && where.type !== 'null') {
      throw new FormulaError('The rollup’s condition must be yes or no', 0);
    }

    const filter = where ? sql` and coalesce(${where.sql}, false)` : sql``;
    const measured = aggregate(rollup.op, value);

    return {
      sql: sql`(select ${measured.sql} from ${rows.from} where ${rows.where}${filter})`,
      type: measured.type,
    };
  }
}

/** The aggregate a rollup takes over the linked records' `value`. */
const aggregate = (
  op: NonNullable<DataFieldRow['settings']['rollup']>['op'],
  value: Typed | null,
): Typed => {
  if (op === 'count') return { sql: sql`count(*)::numeric`, type: 'number' };

  if (!value) throw new FormulaError(`A ${op} rollup needs a field of the linked records`, 0);

  switch (op) {
    case 'countNotEmpty':
      return { sql: sql`count(${value.sql})::numeric`, type: 'number' };
    case 'sum':
    case 'avg':
      if (value.type !== 'number') throw new FormulaError(`A ${op} rollup needs a number field`, 0);

      return {
        sql: op === 'sum' ? sql`coalesce(sum(${value.sql}), 0)` : sql`avg(${value.sql})`,
        type: 'number',
      };
    default:
      if (value.type === 'boolean')
        throw new FormulaError(`A ${op} rollup can't compare yes or no`, 0);

      return { sql: sql`${sql.raw(op)}(${value.sql})`, type: value.type };
  }
};

/**
 * The formula and rollup values of a record type's fields in its own query, whose row is `ext`
 * and record id `id`; `join` gives the query the record's own fields they read, and `uses` the
 * fields each one reads (relations walked included), by its id.
 */
export const computedFor = async (
  client: Db,
  recordType: string,
  fields: DataFieldRow[],
  ext: SQL,
  id: SQL,
) => {
  const values: ComputedValues = new Map();
  const uses = new Map<string, ReadonlySet<string>>();
  const list = fields.filter((field) => isComputed(field.type));

  if (!list.length) return { values, uses, join: sql`` };

  const computer = await Computer.create(client);
  const model = await computer.model(recordType);
  const own = computer.alias('own');
  const row: RecordRow = { ext, native: computer.nativeRow(model, ext, own), id };

  // One at a time, so each field's reads are its own.
  await inOrder(list, async (field) => {
    computer.uses = new Set();
    values.set(field.id, await computedValue(computer, model, row, field));
    uses.set(field.id, computer.uses);
  });

  const join = customKeyOf(recordType) ? sql`` : computer.nativeJoin(model, own, id);

  return { values, uses, join };
};

/** A computed field's value over a record row, or null when it can't be read (a field it read was archived). */
const computedValue = async (
  computer: Computer,
  model: TypeModel,
  row: RecordRow,
  field: DataFieldRow,
) => {
  try {
    return resultOf(await computer.computed(model, row, field, [field.id]));
  } catch (error) {
    if (!(error instanceof FormulaError)) throw error;

    return {
      sql: sql`null`,
      type: field.settings.formula?.result ?? field.settings.rollup?.result ?? 'text',
    };
  }
};
