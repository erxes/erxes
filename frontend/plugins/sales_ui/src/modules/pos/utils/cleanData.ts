export const cleanData = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(cleanData);
  }
  
  if (typeof data === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === '__typename') continue;
      if (key === '_id' && value === null) continue;
      
      cleaned[key] = cleanData(value);
    }
    return cleaned;
  }
  
  return data;
};
