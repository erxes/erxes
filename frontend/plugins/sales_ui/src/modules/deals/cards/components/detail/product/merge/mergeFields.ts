import { IDeal } from '@/deals/types/deals';

/**
 * Which deal's value wins for a conflicting field on the merge screen.
 * Either the target ('This deal') or the merged-in source deal.
 */
export type MergeSelection = 'target' | 'source';

export interface MergeArrayItem {
  _id: string;
  label: string;
  colorCode?: string;
}

interface ArrayFieldDef {
  key: 'assignedUserIds' | 'tagIds' | 'departmentIds';
  label: string;
  /** ids stored on the deal (what we send to the backend). */
  idsOf: (deal?: IDeal) => string[];
  /** resolved display items, in the same order as the ids. */
  itemsOf: (deal?: IDeal) => MergeArrayItem[];
}

interface ScalarFieldDef {
  key: 'priority' | 'closeDate' | 'description';
  label: string;
  valueOf: (deal?: IDeal) => any;
  render: (value: any) => string;
}

export const stripHtml = (value?: string): string =>
  (value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export const formatMergeDate = (value: any): string => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString();
};

export const ARRAY_FIELDS: ArrayFieldDef[] = [
  {
    key: 'assignedUserIds',
    label: 'Assigned to',
    idsOf: (d) => d?.assignedUserIds || [],
    itemsOf: (d) =>
      (d?.assignedUsers || []).map((u) => ({
        _id: u._id,
        label: u.details?.fullName || u.email || u._id,
      })),
  },
  {
    key: 'tagIds',
    label: 'Tags',
    idsOf: (d) => d?.tagIds || [],
    itemsOf: (d) =>
      (d?.tags || []).map((t) => ({
        _id: t._id,
        label: t.name,
        colorCode: t.colorCode,
      })),
  },
  {
    key: 'departmentIds',
    label: 'Departments',
    idsOf: (d) => d?.departmentIds || [],
    itemsOf: (d) =>
      (d?.departments || []).map((dep) => ({
        _id: dep._id,
        label: dep.title,
      })),
  },
];

export const SCALAR_FIELDS: ScalarFieldDef[] = [
  {
    key: 'priority',
    label: 'Priority',
    valueOf: (d) => d?.priority || '',
    render: (v) => v || '—',
  },
  {
    key: 'closeDate',
    label: 'Due date',
    valueOf: (d) => d?.closeDate || null,
    render: (v) => formatMergeDate(v) || '—',
  },
  {
    key: 'description',
    label: 'Description',
    valueOf: (d) => d?.description || '',
    render: (v) => stripHtml(v) || '—',
  },
];

/** Two id arrays hold the same set (order-insensitive). */
export const idSetEqual = (a: string[] = [], b: string[] = []): boolean => {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((id) => setB.has(id));
};

/** Default winner for a field — the target deal ('This deal') keeps its value. */
export const defaultSelection = (): MergeSelection => 'target';

/**
 * Translate the user's per-field choices into the `fields` override object the
 * dealsMerge mutation accepts.
 *   - array  → the chosen deal's ids (target by default)
 *   - scalar 'source' → the source deal's value
 *   - scalar 'target' → omitted (backend keeps the target's value)
 */
export const buildMergeFields = (
  target: IDeal | undefined,
  source: IDeal | undefined,
  selections: Record<string, MergeSelection>,
): Record<string, any> => {
  const fields: Record<string, any> = {};

  for (const field of ARRAY_FIELDS) {
    const selection = selections[field.key] || defaultSelection();
    fields[field.key] =
      selection === 'source' ? field.idsOf(source) : field.idsOf(target);
  }

  for (const field of SCALAR_FIELDS) {
    const selection = selections[field.key] || defaultSelection();
    if (selection === 'source') {
      fields[field.key] = field.valueOf(source);
    }
    // 'target' → leave the target's value untouched
  }

  return fields;
};
