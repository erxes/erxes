import { TTemplatePartsConfig } from 'erxes-api-shared/core-modules';
import { generateModels, IModels } from '~/connectionResolvers';
import { TICKET_STATUS_TYPES } from '~/modules/ticket/constants/types';

// `[[ user.<id> ]]` tokens from a member answer, or plain ids
const toUserIds = (value: unknown) => [
  ...new Set(
    String(value ?? '')
      .split(',')
      .map((item) =>
        item.trim().replace(/^\[\[\s*user\.([^\]\s]+)\s*\]\]$/, '$1'),
      )
      .filter(Boolean),
  ),
];

type TDeskDoc = {
  name?: string;
  description?: string;
  memberIds?: string;
  slaPolicy?: Record<string, unknown>;
  // Ticket numbers: a prefix (`{year}` and the like allowed) and the digits after it
  numberConfig?: string;
  numberSize?: string;
};

/**
 * A team desk for a template: a channel of the chosen members and a ticket
 * pipeline in it, with the default statuses and the template's SLA policy.
 * Tickets open in its first status.
 */
export const createTicketDesk = async ({
  models,
  doc,
  userId,
}: {
  models: IModels;
  doc: TDeskDoc;
  userId: string;
}) => {
  const name = doc.name?.trim() || 'Desk';
  const memberIds = toUserIds(doc.memberIds).filter((id) => id !== userId);
  const channel = await models.Channels.createChannel({
    channelDoc: { name, description: doc.description },
    memberIds,
    adminId: userId,
  });
  const pipeline = await models.Pipeline.addPipeline({
    name,
    description: doc.description,
    channelId: channel._id,
    userId,
    memberIds: [userId, ...memberIds],
    ...(doc.slaPolicy ? { slaPolicy: doc.slaPolicy } : {}),
    // Without a size a ticket is numbered by the clock, which a customer reads
    ...(doc.numberSize
      ? { numberConfig: doc.numberConfig || '', numberSize: doc.numberSize }
      : {}),
  } as Parameters<IModels['Pipeline']['addPipeline']>[0]);
  const statuses = await models.Status.find({ pipelineId: pipeline._id })
    .sort({ order: 1 })
    .lean();
  const statusOf = (type: number) =>
    String(statuses.find((status) => status.type === type)?._id ?? '');

  return {
    _id: String(pipeline._id),
    refs: {
      channelId: String(channel._id),
      pipelineId: String(pipeline._id),
      // Tickets open in the first status
      statusId: String(statuses[0]?._id ?? ''),
      openStatusId: statusOf(TICKET_STATUS_TYPES.OPEN),
      inProgressStatusId: statusOf(TICKET_STATUS_TYPES.IN_PROGRESS),
      resolvedStatusId: statusOf(TICKET_STATUS_TYPES.RESOLVED),
    },
  };
};

/** Gone only while nobody filed a ticket in it: complaint history stays. */
export const removeTicketDesk = async ({
  models,
  _id,
  refs,
}: {
  models: IModels;
  _id: string;
  refs?: Record<string, string>;
}) => {
  if (await models.Ticket.exists({ pipelineId: _id })) {
    return { removed: false, reason: 'Its pipeline has tickets' };
  }

  await models.Status.deleteMany({ pipelineId: _id });
  await models.Pipeline.deleteOne({ _id });

  if (refs?.channelId) {
    await models.ChannelMembers.deleteMany({ channelId: refs.channelId });
    await models.Channels.deleteOne({ _id: refs.channelId });
  }

  return { removed: true };
};

type TRatingDoc = {
  name?: string;
  question?: string;
  commentQuestion?: string;
  thanks?: string;
  channelId?: string;
};

const RATING_OPTIONS = ['1', '2', '3', '4', '5'];

/**
 * A one-question rating form (1 to 5) with an optional comment, answered
 * through a personal form link. Its rating field id is what a "form
 * submitted" trigger's condition names.
 */
export const createRatingForm = async ({
  models,
  doc,
  userId,
}: {
  models: IModels;
  doc: TRatingDoc;
  userId: string;
}) => {
  const name = doc.name?.trim() || 'Rating';
  // A form link is addressed by its channel; without one there is no link
  const ownChannel = doc.channelId
    ? null
    : await models.Channels.createChannel({
        channelDoc: { name, description: 'Rating form channel' },
        memberIds: [],
        adminId: userId,
      });
  const channelId = doc.channelId || String(ownChannel?._id);
  const form = await models.Forms.createForm(
    {
      name,
      title: name,
      type: 'lead',
      status: 'active',
      channelId,
      leadData: { viewCount: 0, contactsGathered: 0, thankContent: doc.thanks },
    } as Parameters<IModels['Forms']['createForm']>[0],
    userId,
  );
  const rating = await models.Fields.createField({
    contentType: 'form',
    contentTypeId: form._id,
    type: 'radio',
    text: doc.question || 'How did we do?',
    options: RATING_OPTIONS,
    isRequired: true,
  } as Parameters<IModels['Fields']['createField']>[0]);
  await models.Fields.createField({
    contentType: 'form',
    contentTypeId: form._id,
    type: 'textarea',
    text: doc.commentQuestion || 'Anything to add?',
    isRequired: false,
  } as Parameters<IModels['Fields']['createField']>[0]);

  return {
    _id: String(form._id),
    refs: {
      formId: String(form._id),
      ratingFieldId: String(rating._id),
      ...(ownChannel ? { ownChannelId: String(ownChannel._id) } : {}),
    },
  };
};

/** Gone only while nobody answered it: ratings stay. */
export const removeRatingForm = async ({
  models,
  _id,
  refs,
}: {
  models: IModels;
  _id: string;
  refs?: Record<string, string>;
}) => {
  if (await models.FormSubmissions.exists({ formId: _id })) {
    return { removed: false, reason: 'It has answers' };
  }

  await models.Fields.deleteMany({ contentType: 'form', contentTypeId: _id });
  await models.Forms.deleteOne({ _id });

  // Only a channel made for this form goes with it
  if (refs?.ownChannelId) {
    await models.ChannelMembers.deleteMany({ channelId: refs.ownChannelId });
    await models.Channels.deleteOne({ _id: refs.ownChannelId });
  }

  return { removed: true };
};

/** Records frontline creates when one of its templates installs. */
export const templateParts: TTemplatePartsConfig<IModels> = {
  generateModels,
  types: {
    'tickets.pipeline': {
      create: ({ models, doc, userId }) =>
        createTicketDesk({ models, doc: doc as TDeskDoc, userId }),
      remove: ({ models, _id, refs }) =>
        removeTicketDesk({ models, _id, refs }),
    },
    'forms.rating': {
      create: ({ models, doc, userId }) =>
        createRatingForm({ models, doc: doc as TRatingDoc, userId }),
      remove: ({ models, _id, refs }) =>
        removeRatingForm({ models, _id, refs }),
    },
  },
};
