import { z } from 'zod';
import { ITicketConfig } from '../app/messenger/types/connection';

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
  if (ticketConfig.ticketBasicFields.isShowTags) {
    schema.tags = z.array(z.string()).default([]);
  }

  if (ticketConfig.ticketBasicFields.isShowName) {
    schema.name = z.string().optional();
  }

  if (ticketConfig.ticketBasicFields.isShowDescription) {
    schema.description = z.string().optional();
  }

  if (ticketConfig.ticketBasicFields.isShowAttachment) {
    schema.attachments = z.array(z.any()).optional();
  }

  return z.object(schema);
}
