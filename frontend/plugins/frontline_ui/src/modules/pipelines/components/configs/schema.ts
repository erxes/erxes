import { z } from 'zod';

const ticketFormFieldsSchema = z.object({
  isShow: z.boolean().optional().nullable(),
  label: z.string().min(1, 'Label is required').optional().nullable(),
  order: z.number().min(1, 'Order is required').optional().nullable(),
  placeholder: z.string().optional().nullable(),
});

const ticketPropertyFieldOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const ticketPropertyFieldSchema = z.object({
  fieldId: z.string().min(1, 'Field is required'),
  groupId: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  placeholder: z.string().optional().nullable(),
  groupOrder: z.number().optional().nullable(),
  order: z.number().optional().nullable(),
  isRequired: z.boolean().optional().nullable(),
  type: z.string().optional().nullable(),
  options: z.array(ticketPropertyFieldOptionSchema).default([]),
});

export const PIPELINE_CONFIG_SCHEMA = z.object({
  name: z.string().min(1, 'Name is required'),
  channelId: z.string().min(1, 'Channel is required'),
  pipelineId: z.string().min(1, 'Pipeline is required'),
  selectedStatusId: z.string().min(1, 'Status is required'),
  parentId: z.string().optional(),
  formFields: z
    .object({
      name: ticketFormFieldsSchema.optional().nullable(),
      description: ticketFormFieldsSchema.optional().nullable(),
      attachment: ticketFormFieldsSchema.optional().nullable(),
      tags: ticketFormFieldsSchema.optional().nullable(),
    })
    .optional()
    .nullable(),
  propertyFields: z.array(ticketPropertyFieldSchema).default([]),
});
