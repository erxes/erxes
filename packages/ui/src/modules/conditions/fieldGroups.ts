import type { TConditionField } from './conditions';

/** Core's own groups, in the order the picker lists them; any other follows. */
export const CORE_GROUPS: Record<string, string> = {
  fields: 'Fields',
  lead: 'Lead',
  company: 'Company',
  activity: 'Activity',
  custom: 'Properties',
};

const ORDER = Object.keys(CORE_GROUPS);

/** A section of the picker: a heading over its fields, each with the label it shows there. */
export type FieldSection = {
  key: string;
  /** A core group's name to translate, or a heading as given (`literal`). */
  heading: string;
  literal: boolean;
  fields: { field: TConditionField; label: string }[];
};

/** A plugin whose fields sit on their own page: its title and how many fields it brings. */
export type FieldApp = { key: string; title: string; count: number };

/**
 * The picker's search: a row matches when its names (`keywords`: label and heading) hold every
 * word typed, so "amount" finds "Amount (total)", not every path with those letters in order.
 */
export const matchField = (value: string, search: string, keywords: string[] = []) => {
  const text = (keywords.length ? keywords : [value]).join(' ').toLowerCase();
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);

  return words.every((word) => text.includes(word)) ? 1 : 0;
};

/** The plugin a field belongs to (`group: 'plugin'`, under its title), or none for core's. */
export const appOf = (field: TConditionField) =>
  field.group === 'plugin' ? (field.groupLabel ?? 'plugin') : undefined;

const groupOf = (field: TConditionField) =>
  field.groupLabel ? `label:${field.groupLabel}` : (field.group ?? 'fields');

const rank = (group: string) => {
  const at = ORDER.indexOf(group);

  return at < 0 ? ORDER.length : at;
};

/** Fields in the order given, grouped by `keyOf`, groups in first-seen order. */
const bucket = <K extends string>(
  fields: TConditionField[],
  keyOf: (field: TConditionField) => K,
) => {
  const groups = new Map<K, TConditionField[]>();

  for (const field of fields) {
    const key = keyOf(field);

    groups.set(key, [...(groups.get(key) ?? []), field]);
  }

  return [...groups];
};

/** Core's fields (and any outside a plugin), under their groups' headings, in core's order. */
export const coreSections = (fields: TConditionField[]): FieldSection[] =>
  bucket(
    fields.filter((field) => !appOf(field)),
    groupOf,
  )
    .toSorted(([a], [b]) => rank(a) - rank(b))
    .map(([key, inGroup]) => ({
      key,
      heading: inGroup[0]?.groupLabel ?? key,
      literal: Boolean(inGroup[0]?.groupLabel),
      fields: inGroup.map((field) => ({ field, label: field.label })),
    }));

/** The plugins that bring fields, in the order their fields come. */
export const fieldApps = (fields: TConditionField[]): FieldApp[] =>
  bucket(fields.filter(appOf), (field) => appOf(field) ?? '').map(([key, inApp]) => ({
    key,
    title: inApp[0]?.groupLabel ?? key,
    count: inApp.length,
  }));

const capitalised = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** "Orders: Total (sum)" under "Orders" is "Total (sum)"; "Orders: count" is "Count". */
const shortLabel = (field: TConditionField) => {
  const prefix = field.relation ? `${field.relation.label}: ` : '';

  return prefix && field.label.startsWith(prefix)
    ? capitalised(field.label.slice(prefix.length))
    : field.label;
};

/**
 * One plugin's page: its own fields first, under its title, then one section per relation
 * ("Orders", "Purchased products") with labels short of the relation's name. With `prefix`
 * (searching everything) headings carry the plugin's title and labels stay whole.
 */
export const appSections = (
  fields: TConditionField[],
  app: string,
  prefix = false,
): FieldSection[] => {
  const inApp = fields.filter((field) => appOf(field) === app);
  const title = inApp[0]?.groupLabel ?? app;

  return bucket(inApp, (field) => (field.relation ? `relation:${field.relation.label}` : 'own'))
    .toSorted(([a], [b]) => Number(a !== 'own') - Number(b !== 'own'))
    .map(([key, inSection]) => {
      const name = inSection[0]?.relation?.label;
      const heading = name ? (prefix ? `${title} · ${name}` : name) : title;

      return {
        key: `${app}:${key}`,
        heading,
        literal: true,
        fields: inSection.map((field) => ({
          field,
          label: prefix ? field.label : shortLabel(field),
        })),
      };
    });
};
