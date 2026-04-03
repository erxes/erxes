export const defaultUserFieldFormatter = (value) => {
    if (value === null || value === undefined) {
      return '';
    }
  
    if (Array.isArray(value)) {
      return value.join('; ');
    }
  
    if (value instanceof Date) {
      return value.toISOString();
    }
  
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
  
    return String(value);
  };
  