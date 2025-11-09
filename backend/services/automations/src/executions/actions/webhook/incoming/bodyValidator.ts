type SchemaField = {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  children?: SchemaField[]; // for object
  arrayItemType?: 'string' | 'number' | 'boolean' | 'object';
  arrayItemSchema?: SchemaField[]; // for array of objects
};

export function validateAgainstSchema(
  schema: SchemaField[],
  body: any,
  path: string = '',
): string[] {
  const errors: string[] = [];

  for (const field of schema) {
    const fieldPath = path ? `${path}.${field.name}` : field.name;
    const value = body?.[field.name];

    // Required check
    if (field.required && (value === undefined || value === null)) {
      const errorMsg = `${fieldPath} is required`;
      errors.push(errorMsg);
      continue;
    }

    // Skip validation if value not provided
    if (value === undefined || value === null) {
      continue;
    }

    switch (field.type) {
      case 'string':
        if (typeof value !== 'string') {
          const errorMsg = `${fieldPath} must be a string`;
          errors.push(errorMsg);
        }
        break;

      case 'number':
        if (typeof value !== 'number') {
          const errorMsg = `${fieldPath} must be a number`;
          errors.push(errorMsg);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          const errorMsg = `${fieldPath} must be a boolean`;
          errors.push(errorMsg);
        }
        break;

      case 'object':
        if (typeof value !== 'object' || Array.isArray(value)) {
          const errorMsg = `${fieldPath} must be an object`;
          errors.push(errorMsg);
        } else if (field.children) {
          errors.push(
            ...validateAgainstSchema(field.children, value, fieldPath),
          );
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          const errorMsg = `${fieldPath} must be an array`;
          errors.push(errorMsg);
        } else {
          value.forEach((item, idx) => {
            const itemPath = `${fieldPath}[${idx}]`;

            if (field.arrayItemType) {
              if (field.arrayItemType === 'object') {
                if (typeof item !== 'object' || Array.isArray(item)) {
                  const errorMsg = `${itemPath} must be an object`;
                  errors.push(errorMsg);
                } else if (field.arrayItemSchema) {
                  errors.push(
                    ...validateAgainstSchema(
                      field.arrayItemSchema,
                      item,
                      itemPath,
                    ),
                  );
                }
              } else if (typeof item !== field.arrayItemType) {
                const errorMsg = `${itemPath} must be a ${field.arrayItemType}`;
                errors.push(errorMsg);
              }
            }
          });
        }
        break;

      default:
        const errorMsg = `${fieldPath} has unknown type ${field.type}`;
        errors.push(errorMsg);
    }
  }

  return errors;
}
