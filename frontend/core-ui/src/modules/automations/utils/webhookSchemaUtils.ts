import { TIncomingWebhookJSONPropertySchema } from '@/automations/components/builder/nodes/triggers/webhooks/types/incomingWebhookJsonBuilder';

export interface WebhookAttribute {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  group: string;
  groupDetail?: {
    name: string;
    description?: string;
  };
  path: string; // Full path to the field (e.g., "user.name", "items[0].price")
}

/**
 * Converts incoming webhook schema properties to automation attributes
 * @param schema - Array of webhook schema properties
 * @param groupName - Name of the attribute group (default: "Webhook Payload")
 * @param basePath - Base path for nested properties (used internally for recursion)
 * @returns Array of attributes compatible with the automation system
 */
export function generateAttributesFromWebhookSchema(
  schema: TIncomingWebhookJSONPropertySchema[],
  groupName: string = 'Webhook Payload',
  basePath: string = '',
): WebhookAttribute[] {
  const attributes: WebhookAttribute[] = [];

  function processProperty(
    property: TIncomingWebhookJSONPropertySchema,
    currentPath: string = '',
  ): void {
    const fullPath = currentPath
      ? `${currentPath}.${property.name}`
      : property.name;

    // Add the current property as an attribute
    attributes.push({
      name: fullPath,
      label: property.description || property.name,
      type: property.type,
      description: property.description,
      group: groupName,
      groupDetail: {
        name: groupName,
        description: 'Fields from incoming webhook payload',
      },
      path: fullPath,
    });

    // Process nested children (for object types)
    if (property.children && property.children.length > 0) {
      property.children.forEach((child) => {
        processProperty(child, fullPath);
      });
    }

    // Process array item schema (for array types)
    if (property.arrayItemSchema && property.arrayItemSchema.length > 0) {
      // Add array index access pattern
      attributes.push({
        name: `${fullPath}[0]`,
        label: `${property.description || property.name} (First Item)`,
        type: property.arrayItemType || 'object',
        description: `First item in ${
          property.description || property.name
        } array`,
        group: groupName,
        groupDetail: {
          name: groupName,
          description: 'Fields from incoming webhook payload',
        },
        path: `${fullPath}[0]`,
      });

      // Process array item properties
      (property?.arrayItemSchema || []).forEach((itemProperty) => {
        processProperty(itemProperty, `${fullPath}[0]`);
      });
    }
  }

  // Process all root-level properties
  (schema || []).forEach((property) => {
    processProperty(property, basePath);
  });

  return attributes;
}

/**
 * Generates a preview of webhook attributes for debugging/testing
 * @param schema - Array of webhook schema properties
 * @returns Formatted string showing all generated attributes
 */
export function previewWebhookAttributes(
  schema: TIncomingWebhookJSONPropertySchema[],
): string {
  const attributes = generateAttributesFromWebhookSchema(schema);

  const grouped = attributes.reduce((acc, attr) => {
    if (!acc[attr.group]) {
      acc[attr.group] = [];
    }
    acc[attr.group].push(attr);
    return acc;
  }, {} as Record<string, WebhookAttribute[]>);

  let preview = 'Generated Webhook Attributes:\n\n';

  Object.entries(grouped).forEach(([groupName, attrs]) => {
    preview += `## ${groupName}\n`;
    attrs.forEach((attr) => {
      preview += `- {{ ${attr.name} }} (${attr.type})`;
      if (attr.description) {
        preview += ` - ${attr.description}`;
      }
      preview += '\n';
    });
    preview += '\n';
  });

  return preview;
}

/**
 * Filters webhook attributes by type
 * @param attributes - Array of webhook attributes
 * @param types - Array of types to filter by
 * @returns Filtered array of attributes
 */
export function filterWebhookAttributesByType(
  attributes: WebhookAttribute[],
  types: Array<'string' | 'number' | 'boolean' | 'object' | 'array'>,
): WebhookAttribute[] {
  return attributes.filter((attr) => types.includes(attr.type));
}

/**
 * Gets all unique paths from webhook attributes
 * @param attributes - Array of webhook attributes
 * @returns Array of unique paths
 */
export function getWebhookAttributePaths(
  attributes: WebhookAttribute[],
): string[] {
  return [...new Set(attributes.map((attr) => attr.path))];
}

/**
 * Validates if a webhook attribute path exists in the schema
 * @param schema - Array of webhook schema properties
 * @param path - Path to validate (e.g., "user.name", "items[0].price")
 * @returns True if path exists in schema
 */
export function validateWebhookAttributePath(
  schema: TIncomingWebhookJSONPropertySchema[],
  path: string,
): boolean {
  const attributes = generateAttributesFromWebhookSchema(schema);
  return attributes.some((attr) => attr.path === path);
}
