// Helper to convert object to array of {key, value} for GraphQL
export const objectToKeyValueArray = (obj: Record<string, any>) =>
  Object.entries(obj).map(([key, value]) => ({ key, value }));

// Helper to convert array of {key, value} back to object
export const keyValueArrayToObject = <T = any>(arr: Array<{ key: string; value: any }>): T => {
  const obj: any = {};
  arr.forEach(({ key, value }) => {
    obj[key] = value;
  });
  return obj as T;
};