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
      errors.push(`${fieldPath} is required`);
      continue;
    }

    // Skip validation if value not provided
    if (value === undefined || value === null) continue;

    switch (field.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`${fieldPath} must be a string`);
        }
        break;

      case 'number':
        if (typeof value !== 'number') {
          errors.push(`${fieldPath} must be a number`);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`${fieldPath} must be a boolean`);
        }
        break;

      case 'object':
        if (typeof value !== 'object' || Array.isArray(value)) {
          errors.push(`${fieldPath} must be an object`);
        } else if (field.children) {
          errors.push(
            ...validateAgainstSchema(field.children, value, fieldPath),
          );
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`${fieldPath} must be an array`);
        } else {
          value.forEach((item, idx) => {
            const itemPath = `${fieldPath}[${idx}]`;

            if (field.arrayItemType) {
              if (field.arrayItemType === 'object') {
                if (typeof item !== 'object' || Array.isArray(item)) {
                  errors.push(`${itemPath} must be an object`);
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
                errors.push(`${itemPath} must be a ${field.arrayItemType}`);
              }
            }
          });
        }
        break;

      default:
        errors.push(`${fieldPath} has unknown type ${field.type}`);
    }
  }

  return errors;
}
