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

  //Contact type
  if (ticketConfig.contactType) {
    schema.contactType = z.string().default(ticketConfig.contactType);
  }

  // Ticket basic fields
  if (ticketConfig.ticketBasicFields.isShowTags) {
    schema.tag = z.string().optional();
  }

  if (ticketConfig.ticketBasicFields.isShowName) {
    schema.name = z.string().optional();
  }

  if (ticketConfig.ticketBasicFields.isShowDescription) {
    schema.description = z.string().optional();
  }

  if (ticketConfig.ticketBasicFields.isShowAttachments) {
    schema.attachments = z.array(z.any()).optional();
  }

  // Customer fields
  if (
    ticketConfig.contactType === 'customer' &&
    ticketConfig.customer.isShowFirstName
  ) {
    schema.firstName = z.string().optional();
  }

  if (
    ticketConfig.contactType === 'customer' &&
    ticketConfig.customer.isShowLastName
  ) {
    schema.lastName = z.string().optional();
  }

  if (
    ticketConfig.contactType === 'customer' &&
    ticketConfig.customer.isShowPhoneNumber
  ) {
    schema.phoneNumber = z.string().optional();
  }

  if (
    ticketConfig.contactType === 'customer' &&
    ticketConfig.customer.isShowEmail
  ) {
    schema.email = z.string().email('Invalid email address').optional();
  }

  // Company fields
  if (
    ticketConfig.contactType === 'company' &&
    ticketConfig.company.isShowName
  ) {
    schema.companyName = z.string().optional();
  }

  if (
    ticketConfig.contactType === 'company' &&
    ticketConfig.company.isShowRegistrationNumber
  ) {
    schema.registrationNumber = z.string().optional();
  }

  if (
    ticketConfig.contactType === 'company' &&
    ticketConfig.company.isShowAddress
  ) {
    schema.address = z.string().optional();
  }

  if (
    ticketConfig.contactType === 'company' &&
    ticketConfig.company.isShowPhoneNumber
  ) {
    schema.companyPhoneNumber = z.string().optional();
  }

  if (
    ticketConfig.contactType === 'company' &&
    ticketConfig.company.isShowEmail
  ) {
    schema.companyEmail = z.string().email('Invalid email address').optional();
  }

  return z.object(schema);
}
