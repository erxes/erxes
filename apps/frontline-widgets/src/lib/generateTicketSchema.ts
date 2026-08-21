import { z } from 'zod';
import {
  ITicketConfig,
  ITicketPropertiesFields,
} from '../app/messenger/types/connection';

// Property field types the ticket widget renders with a dedicated control,
// everything else falls back to a single line text input
export const MULTI_VALUE_PROPERTY_TYPES = ['multiSelect', 'check'];

function generatePropertyFieldSchema(propertyField: ITicketPropertiesFields) {
  const { type, isRequired, label } = propertyField;
  const requiredMessage = `${label || 'This field'} is required`;

  if (MULTI_VALUE_PROPERTY_TYPES.includes(type || '')) {
    const arraySchema = z.array(z.string());

    return isRequired
      ? arraySchema.min(1, requiredMessage)
      : arraySchema.default([]);
  }

  if (type === 'boolean') {
    return z.boolean().default(false);
  }

  if (type === 'date') {
    return isRequired
      ? z.date({ required_error: requiredMessage })
      : z.date().optional();
  }

  return isRequired
    ? z.string().trim().min(1, requiredMessage)
    : z.string().optional();
}

export function generateTicketSchema(ticketConfig: ITicketConfig | null) {
  if (!ticketConfig) {
    return z.object({});
  }

  const schema: Record<string, z.ZodTypeAny> = {};

  if (ticketConfig._id) {
    schema._id = z.string().default(ticketConfig._id);
  }
  if (ticketConfig.pipelineId) {
    schema.pipelineId = z.string().default(ticketConfig.pipelineId);
  }
  if (ticketConfig.channelId) {
    schema.channelId = z.string().default(ticketConfig.channelId);
  }
  if (ticketConfig.selectedStatusId) {
    schema.selectedStatusId = z.string().default(ticketConfig.selectedStatusId);
  }

  // Ticket basic fields
  if (ticketConfig.formFields.tags?.isShow) {
    schema.tags = z.array(z.string()).default([]);
  }

  if (ticketConfig.formFields.name?.isShow) {
    schema.name = z.string().optional();
  }

  if (ticketConfig.formFields.description?.isShow) {
    schema.description = z.string().optional();
  }

  if (ticketConfig.formFields.attachment?.isShow) {
    schema.attachments = z.array(z.any()).optional();
  }

  // Ticket property fields, keyed by field id
  if (ticketConfig.propertyFields?.length) {
    const propertiesShape: Record<string, z.ZodTypeAny> = {};

    for (const propertyField of ticketConfig.propertyFields) {
      propertiesShape[propertyField.fieldId] =
        generatePropertyFieldSchema(propertyField);
    }

    schema.propertiesData = z.object(propertiesShape);
  }

  return z.object(schema);
}
