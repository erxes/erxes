type TField = { value?: string; group?: string };

const titleCase = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (character) => character.toUpperCase());

/** Buckets attributes by their group, or by the prefix before the first dot. */
export const groupFieldsByType = <T extends TField>(fields: T[]) =>
  fields.reduce((grouped: Record<string, T[]>, field) => {
    const { value, group } = field || {};

    const key =
      group ||
      titleCase(
        value?.includes('.')
          ? value.substring(0, value.indexOf('.'))
          : 'general',
      );

    return { ...grouped, [key]: [...(grouped[key] || []), field] };
  }, {});
