import {
  type ContentType,
  type Db,
  organizations,
  pluginInstallations,
  plugins,
  type StoredPluginRelation,
} from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { callerCan } from '~/http/access';
import type { FieldSpec, RelationField, RelationMeasure } from './fieldSpec';

const NUMBER_MEASURES: [RelationMeasure, string][] = [
  ['sum', 'total'],
  ['avg', 'average'],
  ['min', 'lowest'],
  ['max', 'highest'],
];

const DATE_MEASURES: [RelationMeasure, string][] = [
  ['min', 'earliest'],
  ['max', 'latest'],
];

/** Installed plugins' relations of customers or companies that the caller may filter by. */
const installedRelations = async (client: Db, contentType: ContentType) => {
  const rows = await client
    .select({ name: plugins.name, manifest: plugins.manifest })
    .from(plugins)
    .innerJoin(
      pluginInstallations,
      and(eq(pluginInstallations.plugin, plugins.name), eq(pluginInstallations.status, 'active')),
    )
    .where(
      and(
        eq(plugins.status, 'active'),
        sql`jsonb_typeof(${plugins.manifest} -> 'relations') = 'array'`,
      ),
    )
    .orderBy(plugins.name);

  return rows.flatMap(({ name, manifest }) =>
    (manifest?.relations ?? [])
      .filter((relation) => relation.contentType === contentType)
      .filter((relation) => !relation.permission || callerCan(relation.permission))
      .map((relation) => ({ plugin: name, title: manifest?.title ?? name, relation })),
  );
};

/** The rule fields a relation's `where` uses: its view's columns, at `subject.<key>`. */
const whereFields = (relation: StoredPluginRelation, currency: string | undefined) =>
  relation.fields.map((field) => ({
    path: `subject.${field.key}`,
    label: field.label,
    type: field.type,
    options: field.options,
    currency: field.money ? currency : undefined,
  }));

/**
 * Each relation as fields a rule compares: how many related records, and each number field's
 * total, average, lowest and highest, each date field's earliest and latest.
 * `subject.related.<plugin>.<relation>.<measure>[.<field>]`.
 */
export const relationFields = async (
  client: Db,
  contentType: ContentType,
): Promise<FieldSpec[]> => {
  const installed = await installedRelations(client, contentType);

  if (!installed.length) return [];

  const currency = installed.some(({ relation }) => relation.fields.some((field) => field.money))
    ? (await client.select({ currency: organizations.currency }).from(organizations))[0]?.currency
    : undefined;

  return installed.flatMap(({ plugin, title, relation }) => {
    const base = `subject.related.${plugin}.${relation.key}`;
    const meta = { label: relation.label, fields: whereFields(relation, currency) };

    const spec = (measure: RelationMeasure, label: string, field?: RelationField): FieldSpec => ({
      path: field ? `${base}.${measure}.${field.key}` : `${base}.${measure}`,
      label,
      type: field?.type === 'date' ? 'date' : 'number',
      group: 'plugin',
      groupLabel: title,
      currency: field?.money ? currency : undefined,
      expr: sql`null`,
      relation: meta,
      related: { plugin, relation, measure, field },
    });

    return [
      spec('count', `${relation.label}: count`),
      ...relation.fields.flatMap((field) => {
        const measures =
          field.type === 'number' && !field.array
            ? NUMBER_MEASURES
            : field.type === 'date' && !field.array
              ? DATE_MEASURES
              : [];

        const offered = field.measures ? new Set<RelationMeasure>(field.measures) : undefined;

        return measures
          .filter(([measure]) => !offered || offered.has(measure))
          .map(([measure, word]) =>
            spec(measure, `${relation.label}: ${field.label} (${word})`, field),
          );
      }),
    ];
  });
};
