export const readRecordReferencePath = (target: any, path: string) => {
  if (!path) {
    return target;
  }

  return path.split('.').reduce((current, key) => current?.[key], target);
};

export const asArray = <T = any>(value: T | T[] | undefined | null): T[] => {
  if (Array.isArray(value)) {
    return value;
  }

  return value === undefined || value === null ? [] : [value];
};

export const uniq = <T = any>(values: T[]) =>
  Array.from(new Set((values || []).filter(Boolean)));

export const getRecordReferencePluginName = (type: string) =>
  (type || '').split(':')[0];

export const getLocalRecordReferenceType = (
  pluginName: string,
  type: string,
) => {
  const withoutPlugin = type.startsWith(`${pluginName}:`)
    ? type.slice(pluginName.length + 1)
    : type;

  return withoutPlugin.includes('.')
    ? withoutPlugin.split('.').pop() || withoutPlugin
    : withoutPlugin;
};

export const normalizeRecordReferenceType = (
  pluginName: string,
  type: string,
) => (type.includes(':') ? type : `${pluginName}:${type}`);

export const isBlankReferenceValue = (value: any) =>
  value === undefined || value === null || value === '';
