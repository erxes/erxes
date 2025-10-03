export const maskFields = (data: any, keysToMask: string[]): any => {
  if (Array.isArray(data)) {
    return data.map((item) => maskFields(item, keysToMask));
  } else if (typeof data === 'object' && data !== null) {
    return Object.entries(data).reduce((acc: any, [key, value]) => {
      if (keysToMask.includes(key)) {
        acc[key] = '••••••';
      } else {
        acc[key] = maskFields(value, keysToMask);
      }
      return acc;
    }, {});
  }

  return data;
};
