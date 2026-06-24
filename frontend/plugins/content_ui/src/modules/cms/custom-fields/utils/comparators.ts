import { ICustomFieldGroup } from '../types/customFieldTypes';

export const compareByLabel = (
  a: { _id?: string; label?: string; code?: string },
  b: { _id?: string; label?: string; code?: string },
) => {
  const aValue = a.label || a.code || a._id || '';
  const bValue = b.label || b.code || b._id || '';

  if (!aValue && !bValue) return 0;
  if (!aValue) return 1;
  if (!bValue) return -1;

  return aValue.localeCompare(bValue, 'en', {
    numeric: true,
    sensitivity: 'base',
  });
};

// Groups are manually ordered via the `order` column; fall back to label for
// groups that don't have an order yet so they stay stable.
export const compareByOrder = (a: ICustomFieldGroup, b: ICustomFieldGroup) => {
  const aOrder = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
  const bOrder = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;

  if (aOrder !== bOrder) return aOrder - bOrder;
  return compareByLabel(a, b);
};
