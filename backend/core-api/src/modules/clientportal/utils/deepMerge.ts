export function deepMerge<T extends Record<string, any>, U extends Record<string, any>>(
  target: T | undefined,
  source: U | undefined,
): T & U {
  if (!target) {
    return (source || {}) as T & U;
  }

  if (!source) {
    return target as T & U;
  }

  const result: Record<string, any> = { ...target };

  Object.keys(source).forEach((key) => {
    const sourceValue = (source as any)[key];

    if (sourceValue === undefined) {
      return;
    }

    const targetValue = (target as any)[key];

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue, sourceValue);
    } else {
      result[key] = sourceValue;
    }
  });

  return result as T & U;
}

