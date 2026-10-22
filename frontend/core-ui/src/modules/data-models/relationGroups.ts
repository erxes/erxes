import type { ModelField } from './types';

export const relationMembers = (
  field: ModelField,
  fields: ModelField[],
): ModelField[] =>
  field.relation?.morphId && !field.relation.isInverse
    ? fields.filter(
        (entry) =>
          entry.relation?.morphId === field.relation?.morphId &&
          !entry.relation?.isInverse,
      )
    : [field];

export const uniqueModelFields = (fields: ModelField[]): ModelField[] => {
  const seen = new Set<string>();
  return fields.filter((field) => {
    const key =
      !field.relation?.isInverse && field.relation?.morphId
        ? field.relation.morphId
        : field._id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
