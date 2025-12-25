export const resolvePlaceholderValue = (target: any, attribute: string) => {
  const [propertyName, valueToCheck, valueField] = attribute.split('-');

  const parent = target[propertyName] || {};
  // Case 1: customer-customFieldsData-1  (look up in customFieldsData)
  if (valueToCheck?.includes('customFieldsData')) {
    const fieldId = attribute.split('.').pop(); // extract the field number after '.'
    const obj = (parent.customFieldsData || []).find(
      (item: any) => item.field === fieldId,
    );
    return obj?.value ?? '0';
  }

  // Case 2: paymentsData-loyalty-amount  (find in array/object by type)
  if (valueToCheck && valueField) {
    const obj = Array.isArray(parent)
      ? parent.find((item: any) => item.type === valueToCheck)
      : parent[valueToCheck] || {};
    return obj[valueField] || '0';
  }

  // Case 3: customer-loyalty (simple nested property)
  if (valueToCheck) {
    const property = parent[valueToCheck];
    return typeof property === 'object'
      ? property?.value || '0'
      : property || '0';
  }

  // Case 4: simple top-level value (e.g. {{score}})
  return target[attribute] || '0';
};
