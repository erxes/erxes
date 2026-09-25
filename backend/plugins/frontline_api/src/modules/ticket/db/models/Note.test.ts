import { IModels } from '~/connectionResolvers';
import { createNotifications } from '~/utils/notifications';
import {
  findCustomerReplyRecipients,
  loadNoteClass,
} from '@/ticket/db/models/Note';

jest.mock('~/utils/notifications', () => ({
  createNotifications: jest.fn(),
}));

interface ITicketStub {
  _id: string;
  statusId?: string;
  pipelineId?: string;
  assigneeId?: string;
  assignedMembers?: string[];
  subscribedUserIds?: string[];
}

const lean = <T>(value: T) => ({ lean: async () => value });

const buildModels = (
  ticket: ITicketStub | null,
  pipeline: { userId?: string } | null = null,
) =>
  ({
    Ticket: {
      findOne: jest.fn(() => lean(ticket)),
      updateOne: jest.fn(),
    },
    Pipeline: { findOne: jest.fn(() => lean(pipeline)) },
    Note: {
      create: jest.fn(async (doc: Record<string, unknown>) => ({
        _id: 'note-1',
        ...doc,
      })),
    },
    Activity: { createActivity: jest.fn() },
  } as unknown as IModels);

const createNote = (models: IModels) =>
  loadNoteClass(models).statics.createNote as (args: {
    doc: Record<string, unknown>;
    subdomain: string;
    userId: string;
  }) => Promise<unknown>;

describe('findCustomerReplyRecipients', () => {
  it('collects the assignee, assigned members and subscribers once each', async () => {
    const models = buildModels({
      _id: 'ticket-1',
      assigneeId: 'saraa',
      assignedMembers: ['saraa', 'bold'],
      subscribedUserIds: ['dorj', 'bold', 'cp:customer-1'],
    });

    await expect(
      findCustomerReplyRecipients(models, 'ticket-1'),
    ).resolves.toEqual(['saraa', 'bold', 'dorj']);
  });

  it('falls back to the pipeline owner when nobody follows the ticket', async () => {
    const models = buildModels(
      {
        _id: 'ticket-1',
        pipelineId: 'pipeline-1',
        subscribedUserIds: ['cp:c'],
      },
      { userId: 'owner' },
    );

    await expect(
      findCustomerReplyRecipients(models, 'ticket-1'),
    ).resolves.toEqual(['owner']);
  });

  it('returns nobody for a missing ticket', async () => {
    await expect(
      findCustomerReplyRecipients(buildModels(null), 'ticket-1'),
    ).resolves.toEqual([]);
  });
});

describe('Note.createNote notifications', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('tells the team when the customer writes', async () => {
    const models = buildModels({
      _id: 'ticket-1',
      statusId: 'status-1',
      assigneeId: 'saraa',
      subscribedUserIds: ['dorj'],
    });

    await createNote(models)({
      doc: {
        content: '<p>Here is the screenshot</p>',
        contentId: 'ticket-1',
        createdBy: 'cp:customer-1',
        isInternal: false,
      },
      subdomain: 'test',
      userId: 'cp:customer-1',
    });

    expect(createNotifications).toHaveBeenCalledTimes(1);
    expect(createNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        notificationType: 'ticketCustomerReply',
        contentTypeId: 'ticket-1',
        userIds: ['saraa', 'dorj'],
      }),
    );
  });

  it('stays quiet when an agent writes without mentions', async () => {
    const models = buildModels({
      _id: 'ticket-1',
      statusId: 'status-1',
      assigneeId: 'saraa',
      subscribedUserIds: ['dorj'],
    });

    await createNote(models)({
      doc: {
        content: '[]',
        contentId: 'ticket-1',
        createdBy: 'saraa',
        isInternal: true,
      },
      subdomain: 'test',
      userId: 'saraa',
    });

    expect(createNotifications).not.toHaveBeenCalled();
  });
});
