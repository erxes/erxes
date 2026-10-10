import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { sendPosclientMessage } from '../initWorker';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));

const sendMessage = jest.mocked(sendTRPCMessage);
const request = {
  subdomain: 'tenant',
  pos: { token: 'pos-token', onServer: true },
  action: 'crudData',
  method: 'mutation' as const,
  input: { type: 'productGroups', productGroups: [] },
};

beforeEach(() => sendMessage.mockReset());

it('propagates product sync failures when requested', async () => {
  sendMessage.mockRejectedValue(new Error('Payload Too Large'));

  await expect(
    sendPosclientMessage({ ...request, throwOnError: true }),
  ).rejects.toThrow('Payload Too Large');
  expect(sendMessage).toHaveBeenCalledWith({
    subdomain: 'tenant',
    pluginName: 'posclient',
    module: 'posclient',
    action: 'crudData',
    method: 'mutation',
    input: { ...request.input, token: 'pos-token' },
    defaultValue: {},
    throwOnError: true,
  });
});

it('preserves the default transport error policy for other callers', async () => {
  sendMessage.mockResolvedValue({});

  await expect(sendPosclientMessage(request)).resolves.toEqual({});
  expect(sendMessage.mock.calls[0][0].throwOnError).toBeUndefined();
});
