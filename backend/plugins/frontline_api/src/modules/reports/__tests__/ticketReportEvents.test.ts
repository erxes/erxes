import type { IContext, IModels } from '~/connectionResolvers';
import type { GraphQLResolveInfo } from 'graphql';
import { widgetMutations } from '@/inbox/graphql/resolvers/mutations/widget';
import {
  WIDGET_SESSION_HEADER,
  signWidgetSession,
} from '@/inbox/widgetSession';
import { ticketAutomationProducers } from '@/ticket/meta/automations/ticketAutomationsProducers';
import type { setProperty } from 'erxes-api-shared/core-modules';
import { publishReportUpdate } from '@/reports/realtime';

jest.mock('~/connectionResolvers', () => ({ generateModels: jest.fn() }));
jest.mock('@/reports/realtime', () => ({ publishReportUpdate: jest.fn() }));
jest.mock('erxes-api-shared/utils', () => ({
  markResolvers: jest.fn(),
  sendTRPCMessage: jest.fn(),
  graphqlPubsub: { publish: jest.fn() },
  validSearchText: (values: string[]) => values.join(' '),
}));
jest.mock('erxes-api-shared/core-modules', () => ({
  setProperty: (options: Parameters<typeof setProperty>[0]) =>
    mockSetProperty(options),
  getSetPropertySelector: jest.fn().mockResolvedValue({ _id: 'ticket-1' }),
}));
jest.mock('@/ticket/meta/automations/ticketPropertyWrites', () => ({
  prepareTicketPropertyWrite: jest
    .fn()
    .mockResolvedValue({ $set: { priority: 3 } }),
}));
jest.mock('@/ticket/meta/automations/actions/createTicketAction', () => ({
  createTicketAction: jest.fn(),
}));

const publish = jest.mocked(publishReportUpdate);
const mockSetProperty = jest.fn<
  Promise<unknown>,
  [Parameters<typeof setProperty>[0]]
>();
beforeEach(() => {
  publish.mockReset().mockResolvedValue(undefined);
});

it('invalidates ticket reports after a widget ticket is persisted', async () => {
  const create = jest.fn().mockResolvedValue({ _id: 'ticket-1' });
  const models = {
    Integrations: {
      findOne: () => ({
        lean: async () => ({ ticketConfigIds: ['config-1'] }),
      }),
    },
    TicketConfig: {
      findOne: () => ({
        then: (resolve: (value: object) => unknown) =>
          Promise.resolve({}).then(resolve),
        lean: async () => ({ propertyFields: [] }),
      }),
    },
    Status: {
      findOne: jest
        .fn()
        .mockResolvedValue({ _id: 'status-1', pipelineId: 'pipeline-1' }),
    },
    Pipeline: {
      findOne: jest
        .fn()
        .mockResolvedValue({ _id: 'pipeline-1', channelId: 'channel-1' }),
    },
    Ticket: { create },
  } as unknown as IModels;
  const context = {
    models,
    subdomain: 'tenant-a',
    req: {
      headers: {
        [WIDGET_SESSION_HEADER]: signWidgetSession({
          integrationId: 'integration-1',
          customerId: 'customer-1',
        }),
      },
    },
  } as unknown as IContext;

  await widgetMutations.widgetTicketCreated(
    undefined,
    {
      statusId: 'status-1',
      name: 'Customer request',
      tagIds: [],
      attachments: [],
    },
    context,
    {} as GraphQLResolveInfo,
  );

  expect(create).toHaveBeenCalledWith(
    expect.objectContaining({ customerId: 'customer-1' }),
  );
  expect(publish).toHaveBeenCalledWith('tenant-a', ['ticket']);
  expect(create.mock.invocationCallOrder[0]).toBeLessThan(
    publish.mock.invocationCallOrder[0],
  );
});

it.each([0, 1])(
  'invalidates an automation write only when it changes tickets: %s',
  async (modifiedCount) => {
    const updateMany = jest.fn().mockResolvedValue({ modifiedCount });
    mockSetProperty.mockImplementationOnce(async ({ update }) => {
      if (!update) throw new Error('Expected ticket property updater');
      return update({
        selector: { _id: 'ticket-1' },
        modifier: { $set: { priority: 3 } },
        item: { _id: 'ticket-1' },
      });
    });
    const input = {
      action: { config: { module: 'frontline:ticket', rules: [] } },
      execution: { target: {} },
      targetType: 'frontline:ticket',
    } as unknown as Parameters<
      typeof ticketAutomationProducers.setProperties
    >[0];
    const context = {
      subdomain: 'tenant-a',
      models: { Ticket: { updateMany } },
    } as unknown as Parameters<
      typeof ticketAutomationProducers.setProperties
    >[1];

    await ticketAutomationProducers.setProperties(input, context);

    expect(updateMany).toHaveBeenCalledWith(
      { _id: 'ticket-1' },
      { $set: { priority: 3 } },
    );
    if (modifiedCount)
      expect(publish).toHaveBeenCalledWith('tenant-a', ['ticket']);
    else expect(publish).not.toHaveBeenCalled();
  },
);
