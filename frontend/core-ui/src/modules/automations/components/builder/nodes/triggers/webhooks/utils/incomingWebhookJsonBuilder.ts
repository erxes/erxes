export function updateNestedProperty(
  properties: TIncomingWebhookJSONPropertySchema[],
  targetId: string,
  updater: (
    prop: TIncomingWebhookJSONPropertySchema,
  ) => TIncomingWebhookJSONPropertySchema,
): TIncomingWebhookJSONPropertySchema[] {
  return properties.map((prop) => {
    if (prop.id === targetId) return updater(prop);

    if (prop.children) {
      return {
        ...prop,
        children: updateNestedProperty(prop.children, targetId, updater),
      };
    }

    if (prop.arrayItemSchema) {
      return {
        ...prop,
        arrayItemSchema: updateNestedProperty(
          prop.arrayItemSchema,
          targetId,
          updater,
        ),
      };
    }

    return prop;
  });
}

export function removeNestedProperty(
  properties: TIncomingWebhookJSONPropertySchema[],
  targetId: string,
): TIncomingWebhookJSONPropertySchema[] {
  return properties.filter((prop) => {
    if (prop.id === targetId) return false;

    if (prop.children) {
      prop.children = removeNestedProperty(prop.children, targetId);
    }

    if (prop.arrayItemSchema) {
      prop.arrayItemSchema = removeNestedProperty(
        prop.arrayItemSchema,
        targetId,
      );
    }

    return true;
  });
}

export function generateSchemaPreview(
  properties: TIncomingWebhookJSONPropertySchema[],
): unknown {
  const result: Record<string, unknown> = {};

  for (const {
    name,
    type,
    children,
    arrayItemSchema,
    arrayItemType,
  } of properties || []) {
    if (!name) {
      continue;
    }

    switch (type) {
      case 'string':
        result[name] = 'string_value';
        break;
      case 'number':
        result[name] = 123;
        break;
      case 'boolean':
        result[name] = true;
        break;
      case 'object':
        result[name] = children ? generateSchemaPreview(children) : {};
        break;
      case 'array':
        if (arrayItemType === 'object' && arrayItemSchema) {
          result[name] = [
            generateSchemaPreview(arrayItemSchema) as Record<string, unknown>,
          ];
        } else {
          const sampleValue =
            arrayItemType === 'string'
              ? 'string_value'
              : arrayItemType === 'number'
              ? 123
              : arrayItemType === 'boolean'
              ? true
              : 'mixed_value';
          result[name] = [sampleValue];
        }
        break;
    }
  }

  return result;
}

export function updatePropertyInList(
  list: TIncomingWebhookJSONPropertySchema[],
  id: string,
  field: string,
  value: unknown,
): TIncomingWebhookJSONPropertySchema[] {
  return updateNestedProperty(list, id, (prop) => ({
    ...prop,
    [field]: value,
  }));
}

export function removePropertyFromList(
  list: TIncomingWebhookJSONPropertySchema[],
  id: string,
): TIncomingWebhookJSONPropertySchema[] {
  return removeNestedProperty(list, id);
}

export function addChildProperty(
  list: TIncomingWebhookJSONPropertySchema[],
  parentId: string,
): TIncomingWebhookJSONPropertySchema[] {
  return updateNestedProperty(list, parentId, (prop) => ({
    ...prop,
    children: [...(prop.children || []), createNewRootProperty()],
  }));
}

export function toggleExpandedInList(
  list: TIncomingWebhookJSONPropertySchema[],
  id: string,
): TIncomingWebhookJSONPropertySchema[] {
  return updateNestedProperty(list, id, (prop) => ({
    ...prop,
    isExpanded: !prop.isExpanded,
  }));
}

import { TIncomingWebhookJSONPropertySchema } from '@/automations/components/builder/nodes/triggers/webhooks/types/incomingWebhookJsonBuilder';
import { generateAutomationElementId } from 'ui-modules';
export function createNewRootProperty(): TIncomingWebhookJSONPropertySchema {
  return {
    id: generateAutomationElementId(),
    name: '',
    type: 'string',
    required: true,
    description: '',
    isExpanded: true,
  };
}
