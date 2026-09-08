import { graphqlPubsub, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { ITicketDocument } from '@/ticket/@types/ticket';
import { IMailIntegrationDocument } from '@/integrations/mail/@types/integration';
import {
  IMailMessageDocument,
  IMailTicketMailArgs,
} from '@/integrations/mail/@types/message';
import { findPipelineIntegration } from '@/integrations/mail/utils/pipeline';
import { mailScopeId } from '@/integrations/mail/utils/scope';
import { toPlainText } from '@/integrations/mail/utils/transports/common';

const TICKET_TYPE = 'frontline:ticket';

const CUSTOMER_TYPE = 'core:customer';

const UNTITLED_TICKET = 'Mail without a subject';

const DESCRIPTION_LIMIT = 2000;

export interface IMailTicketSendArgs extends Omit<IMailTicketMailArgs, 'to'> {
  to?: string[];
}

interface ICreateTicketFromMailInput {
  models: IModels;
  subdomain: string;
  pipelineId: string;
  customerId: string;
  subject?: string;
  body: string;
}

const relate = (
  subdomain: string,
  entities: { contentType: string; contentId: string }[],
) =>
  sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'relation',
    action: 'createRelation',
    input: { relation: { entities } },
  });

const relatedIds = async (
  subdomain: string,
  ticketId: string,
  relatedContentType: string,
): Promise<string[]> => {
  const ids: string[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'relation',
    action: 'getRelationIds',
    input: {
      contentType: TICKET_TYPE,
      contentId: ticketId,
      relatedContentType,
    },
    defaultValue: [],
  });

  return ids.filter(Boolean);
};

const toDescription = (body: string) => {
  const text = toPlainText(body).trim();

  return text.length > DESCRIPTION_LIMIT
    ? text.slice(0, DESCRIPTION_LIMIT)
    : text;
};

export const createTicketFromMail = async ({
  models,
  subdomain,
  pipelineId,
  customerId,
  subject,
  body,
}: ICreateTicketFromMailInput): Promise<ITicketDocument> => {
  const pipeline = await models.Pipeline.findOne({ _id: pipelineId }).lean();

  if (!pipeline) {
    throw new Error(`Ticket pipeline ${pipelineId} no longer exists`);
  }

  const status = await models.Status.findOne({ pipelineId })
    .sort({ order: 1 })
    .lean();

  if (!status) {
    throw new Error(
      `Ticket pipeline ${pipeline.name} has no status to open in`,
    );
  }

  const openedBy = pipeline.userId ?? '';

  const ticket = await models.Ticket.addTicket(
    {
      name: subject?.trim() || UNTITLED_TICKET,
      channelId: pipeline.channelId,
      pipelineId,
      stageId: '',
      statusId: status._id,
      description: toDescription(body),
    },
    openedBy,
    subdomain,
  );

  if (!openedBy) {
    await models.Ticket.updateOne(
      { _id: ticket._id },
      { $set: { subscribedUserIds: [] } },
    );
  }

  await relate(subdomain, [
    { contentType: CUSTOMER_TYPE, contentId: customerId },
    { contentType: TICKET_TYPE, contentId: ticket._id },
  ]);

  await graphqlPubsub.publish(`ticketChanged:${ticket._id}`, {
    ticketChanged: { type: 'create', ticket },
  });

  await graphqlPubsub.publish('ticketListChanged', {
    ticketListChanged: { type: 'create', ticket },
  });

  return ticket;
};

export const isTicketOpen = async (models: IModels, ticketId: string) => {
  const ticket = await models.Ticket.findOne({ _id: ticketId }).lean();

  return Boolean(ticket && (ticket.state ?? 'active') === 'active');
};

export const findTicketIntegration = async (
  models: IModels,
  ticket: ITicketDocument,
): Promise<IMailIntegrationDocument> => {
  const integration = await findPipelineIntegration(models, ticket.pipelineId);

  if (!integration) {
    throw new Error(
      'This ticket sits in a pipeline that has no mail address yet',
    );
  }

  return integration;
};

const resolveTicketRecipient = async (
  subdomain: string,
  ticketId: string,
): Promise<string | undefined> => {
  const customerIds = await relatedIds(subdomain, ticketId, CUSTOMER_TYPE);

  for (const customerId of customerIds) {
    const customer: { primaryEmail?: string } | null = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'findOne',
      input: { query: { _id: customerId } },
      defaultValue: null,
    });

    if (customer?.primaryEmail) {
      return customer.primaryEmail;
    }
  }

  return undefined;
};

export const sendTicketMail = async (
  models: IModels,
  subdomain: string,
  ticket: ITicketDocument,
  args: IMailTicketSendArgs,
): Promise<IMailMessageDocument> => {
  const integration = await findTicketIntegration(models, ticket);

  const recipients = args.to?.length
    ? args.to
    : [await resolveTicketRecipient(subdomain, ticket._id)];

  const to = recipients
    .filter((address): address is string => Boolean(address?.trim()))
    .map((address) => address.trim().toLowerCase());

  if (!to.length) {
    throw new Error(
      'This ticket has no customer with an email address — name a recipient to write to',
    );
  }

  const customerId = await models.MailCustomers.findOrCreate(
    subdomain,
    to[0],
    mailScopeId(integration),
  );

  return models.MailMessages.createTicketMail(
    integration,
    { ...args, to, customerId, ticketId: ticket._id },
    subdomain,
  );
};
