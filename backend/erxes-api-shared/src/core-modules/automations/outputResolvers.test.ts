import { resolveRecordReferenceValue } from '../common/references';
import { resolveOutputPathsByNodeType } from './outputResolvers';

jest.mock('../common/references', () => ({
  resolveRecordReferenceValue: jest.fn(),
}));

const mockedResolveRecordReferenceValue = jest.mocked(
  resolveRecordReferenceValue,
);

describe('resolveOutputPathsByNodeType', () => {
  beforeEach(() => {
    mockedResolveRecordReferenceValue.mockReset();
  });

  it('resolves action-created targets from their current entity state', async () => {
    mockedResolveRecordReferenceValue.mockImplementation(async (input) => {
      if (input.type === 'frontline:ticket' && input.path === 'description') {
        return 'Resolved complaint';
      }

      if (input.type === 'frontline:ticket' && input.path === 'assigneeId') {
        return 'user-1';
      }

      if (input.type === 'core:user' && input.path === 'displayName') {
        return 'Support Agent';
      }

      return input.defaultValue;
    });

    const result = await resolveOutputPathsByNodeType({
      subdomain: 'test',
      nodeType: 'frontline:tickets.tickets.create',
      source: {
        targetId: 'ticket-1',
        description: 'Original complaint',
        assigneeId: 'user-old',
      },
      paths: ['description', 'assigneeId.displayName'],
      runtimeOutputs: {
        'frontline:tickets.tickets.create': {
          variables: [
            { key: 'description', label: 'Description' },
            {
              key: 'assigneeId',
              label: 'Assignee',
              exposure: 'reference',
              referenceType: 'core:user',
            },
          ],
          propertySource: {
            key: 'properties',
            label: 'Ticket properties',
            propertyType: 'frontline:ticket',
          },
        },
      },
    });

    expect(result).toEqual({
      description: 'Resolved complaint',
      'assigneeId.displayName': 'Support Agent',
    });
    expect(mockedResolveRecordReferenceValue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'frontline:ticket',
        targetId: 'ticket-1',
        path: 'description',
      }),
    );
  });

  it('keeps resolving root execution sources directly', async () => {
    const result = await resolveOutputPathsByNodeType({
      subdomain: 'test',
      nodeType: 'frontline:tickets.tickets',
      source: { description: 'Trigger description' },
      paths: ['description'],
      runtimeOutputs: {
        'frontline:tickets.tickets': {
          variables: [{ key: 'description', label: 'Description' }],
          propertySource: {
            key: 'properties',
            label: 'Ticket properties',
            propertyType: 'frontline:ticket',
          },
        },
      },
    });

    expect(result).toEqual({ description: 'Trigger description' });
    expect(mockedResolveRecordReferenceValue).not.toHaveBeenCalled();
  });
});
