import { sendTRPCMessage } from 'erxes-api-shared/utils';
import {
  ITicketPropertyField,
  ITicketPropertyFieldOption,
} from '@/ticket/@types/ticketConfig';

export const TICKET_PROPERTY_CONTENT_TYPE = 'frontline:ticket';

/**
 * Validates the property fields chosen in a messenger ticket form configuration:
 * every entry must reference an existing ticket property field, duplicates are
 * dropped and the display order is normalized to a 1 based sequence following
 * the submitted order of the list.
 */
export const validateTicketPropertyFields = async (
  subdomain: string,
  propertyFields?: ITicketPropertyField[] | null,
): Promise<ITicketPropertyField[]> => {
  if (!propertyFields?.length) {
    return [];
  }

  const uniqueFields: ITicketPropertyField[] = [];

  for (const propertyField of propertyFields) {
    if (!propertyField?.fieldId) {
      throw new Error('Property field id is required');
    }

    if (!uniqueFields.some((f) => f.fieldId === propertyField.fieldId)) {
      uniqueFields.push(propertyField);
    }
  }

  const fields: {
    _id: string;
    groupId?: string;
    type?: string;
    options?: ITicketPropertyFieldOption[];
  }[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'fields',
    action: 'find',
    input: {
      query: {
        _id: { $in: uniqueFields.map((f) => f.fieldId) },
        contentType: TICKET_PROPERTY_CONTENT_TYPE,
      },
      projection: null,
      sort: { order: 1 },
    },
    defaultValue: [],
  });

  const fieldById = new Map(fields.map((field) => [String(field._id), field]));

  const existingFields = uniqueFields.filter((propertyField) =>
    fieldById.has(propertyField.fieldId),
  );

  // Both orders come from the submitted array, never from the submitted values:
  // a property's position is its `order`, and the position of the block its
  // group forms is that group's `groupOrder`.
  const groupPositions = new Map<string, number>();

  return existingFields.map((propertyField, index) => {
    const field = fieldById.get(propertyField.fieldId);
    const groupId = propertyField.groupId || field?.groupId || undefined;
    const groupKey = groupId || '';

    if (!groupPositions.has(groupKey)) {
      groupPositions.set(groupKey, groupPositions.size + 1);
    }

    return {
      fieldId: propertyField.fieldId,
      groupId,
      label: propertyField.label || undefined,
      placeholder: propertyField.placeholder || undefined,
      isRequired: !!propertyField.isRequired,
      groupOrder: groupPositions.get(groupKey),
      order: index + 1,
      // type and options always mirror the current property definition
      type: field?.type || undefined,
      options: (field?.options || []).map(({ label, value }) => ({
        label,
        value,
      })),
    };
  });
};
