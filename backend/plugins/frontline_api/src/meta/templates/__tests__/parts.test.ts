import {
  createRatingForm,
  createTicketDesk,
  removeRatingForm,
  removeTicketDesk,
} from '../parts';

const buildModels = ({ hasTickets = false } = {}) => {
  const calls: Record<string, unknown[]> = {};
  const record = (name: string, result?: unknown) =>
    jest.fn(async (...args: unknown[]) => {
      calls[name] = args;
      return result;
    });
  const models = {
    Channels: {
      createChannel: record('createChannel', { _id: 'c-1' }),
      deleteOne: record('deleteChannel'),
    },
    ChannelMembers: { deleteMany: record('deleteMembers') },
    Pipeline: {
      addPipeline: record('addPipeline', { _id: 'p-1' }),
      deleteOne: record('deletePipeline'),
    },
    Status: {
      find: jest.fn(() => ({
        sort: () => ({
          lean: async () => [
            { _id: 's-new', type: 1 },
            { _id: 's-open', type: 2 },
            { _id: 's-progress', type: 3 },
            { _id: 's-resolved', type: 4 },
          ],
        }),
      })),
      deleteMany: record('deleteStatuses'),
    },
    Ticket: { exists: jest.fn(async () => (hasTickets ? { _id: 't' } : null)) },
  };

  return { models: models as never, calls };
};

describe('ticket desk part', () => {
  it('makes a channel of the members and a pipeline that opens tickets in its first status', async () => {
    const { models, calls } = buildModels();

    const created = await createTicketDesk({
      models,
      userId: 'me',
      doc: {
        name: 'Complaints',
        memberIds: '[[ user.u1 ]],[[ user.me ]],u2',
        slaPolicy: { enabled: true, rules: [] },
        numberConfig: 'C{year}-',
        numberSize: '4',
      },
    });

    expect(created).toEqual({
      _id: 'p-1',
      refs: {
        channelId: 'c-1',
        pipelineId: 'p-1',
        statusId: 's-new',
        openStatusId: 's-open',
        inProgressStatusId: 's-progress',
        resolvedStatusId: 's-resolved',
      },
    });
    expect(calls.createChannel[0]).toMatchObject({
      channelDoc: { name: 'Complaints' },
      memberIds: ['u1', 'u2'],
      adminId: 'me',
    });
    expect(calls.addPipeline[0]).toMatchObject({
      name: 'Complaints',
      channelId: 'c-1',
      memberIds: ['me', 'u1', 'u2'],
      slaPolicy: { enabled: true },
      // Tickets get readable numbers instead of the clock
      numberConfig: 'C{year}-',
      numberSize: '4',
    });
  });

  it('stays while it has tickets, and goes whole otherwise', async () => {
    const kept = buildModels({ hasTickets: true });

    await expect(
      removeTicketDesk({
        models: kept.models,
        _id: 'p-1',
        refs: { channelId: 'c-1' },
      }),
    ).resolves.toEqual({ removed: false, reason: 'Its pipeline has tickets' });
    expect(kept.calls.deletePipeline).toBeUndefined();

    const empty = buildModels();

    await expect(
      removeTicketDesk({
        models: empty.models,
        _id: 'p-1',
        refs: { channelId: 'c-1' },
      }),
    ).resolves.toEqual({ removed: true });
    expect(empty.calls.deleteChannel).toEqual([{ _id: 'c-1' }]);
  });
});

describe('rating form part', () => {
  it('makes a 1 to 5 question and names its field for trigger conditions', async () => {
    const fields: Record<string, unknown>[] = [];
    const createForm = jest.fn(async () => ({ _id: 'f-1' }));
    const models = {
      Channels: { createChannel: jest.fn(async () => ({ _id: 'rc-1' })) },
      Forms: { createForm },
      Fields: {
        createField: jest.fn(async (doc: Record<string, unknown>) => {
          fields.push(doc);
          return { _id: `field-${fields.length}` };
        }),
      },
    } as never;

    await expect(
      createRatingForm({
        models,
        userId: 'me',
        doc: { name: 'Complaint rating' },
      }),
    ).resolves.toEqual({
      _id: 'f-1',
      refs: { formId: 'f-1', ratingFieldId: 'field-1', ownChannelId: 'rc-1' },
    });
    // A form link is addressed by its channel
    expect(createForm).toHaveBeenCalledWith(
      expect.objectContaining({ channelId: 'rc-1' }),
      'me',
    );
    expect(fields[0]).toMatchObject({
      contentTypeId: 'f-1',
      type: 'radio',
      options: ['1', '2', '3', '4', '5'],
      isRequired: true,
    });
  });

  it('removes the channel it made with it, and only that one', async () => {
    const deleteChannel = jest.fn();
    const models = {
      FormSubmissions: { exists: jest.fn(async () => null) },
      Fields: { deleteMany: jest.fn() },
      Forms: { deleteOne: jest.fn() },
      ChannelMembers: { deleteMany: jest.fn() },
      Channels: { deleteOne: deleteChannel },
    } as never;

    await removeRatingForm({ models, _id: 'f-1', refs: { ownChannelId: 'rc-1' } });
    expect(deleteChannel).toHaveBeenCalledWith({ _id: 'rc-1' });

    deleteChannel.mockClear();
    await removeRatingForm({ models, _id: 'f-1', refs: {} });
    expect(deleteChannel).not.toHaveBeenCalled();
  });

  it('stays once someone answered it', async () => {
    const models = {
      FormSubmissions: { exists: jest.fn(async () => ({ _id: 's' })) },
    } as never;

    await expect(removeRatingForm({ models, _id: 'f-1' })).resolves.toEqual({
      removed: false,
      reason: 'It has answers',
    });
  });
});

describe('template parts registry', () => {
  it('creates every part type frontline templates declare', async () => {
    const { templates } = await import('../index');
    const { templateParts } = await import('../parts');
    const declared = templates.flatMap(({ parts }) =>
      parts
        .map(({ type }) => type)
        .filter((type) => type.startsWith('frontline:')),
    );

    for (const type of declared) {
      // Core sends everything after the plugin name
      expect(Object.keys(templateParts.types)).toContain(
        type.slice('frontline:'.length),
      );
    }
    expect(declared.length).toBeGreaterThan(0);
  });
});
