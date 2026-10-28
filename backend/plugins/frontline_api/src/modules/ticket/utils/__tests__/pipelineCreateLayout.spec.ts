jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));

import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { validatePipelineCreateLayout } from '../pipelineCreateLayout';

const sendTRPCMessageMock = sendTRPCMessage as jest.Mock;

beforeEach(() => {
  sendTRPCMessageMock.mockReset();
});

describe('pipeline create form layout', () => {
  test('null or missing goes back to the default form', async () => {
    await expect(validatePipelineCreateLayout('sub', null)).resolves.toBeNull();
    await expect(
      validatePipelineCreateLayout('sub', undefined),
    ).resolves.toBeNull();
  });

  test('keeps system fields and live properties, drops the rest', async () => {
    sendTRPCMessageMock.mockResolvedValueOnce([{ _id: 'live' }]);

    await expect(
      validatePipelineCreateLayout('sub', [
        ['priority', 'property:live'],
        ['property:deleted'],
        [],
        ['assigneeId', 'priority'],
      ]),
    ).resolves.toEqual([['priority', 'property:live'], ['assigneeId']]);
  });

  test('refuses fields fixed outside the rows or unknown', async () => {
    await expect(
      validatePipelineCreateLayout('sub', [['name']]),
    ).rejects.toThrow('"name" cannot be placed on the create form');
    await expect(
      validatePipelineCreateLayout('sub', [['nope']]),
    ).rejects.toThrow('cannot be placed');
  });

  test('refuses a row wider than four fields', async () => {
    await expect(
      validatePipelineCreateLayout('sub', [
        ['priority', 'assigneeId', 'branchId', 'departmentId', 'tagIds'],
      ]),
    ).rejects.toThrow('at most 4');
  });
});
