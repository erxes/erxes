import { createHmac } from 'node:crypto';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { postizBridge } from '../bridge';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));

const jwtSecret = 'cms-test-jwt';
// Independent HKDF vector, also checked by agent_api's verifier tests.
const signingKey = Buffer.from(
  '2c780cea76b0f843c003d52fa83ecc15e3d5a36e48723b73e2e4107e990d5643',
  'hex',
);

beforeEach(() => {
  jest.clearAllMocks();
  jest.replaceProperty(process, 'env', {
    ...process.env,
    JWT_TOKEN_SECRET: jwtSecret,
  });
  delete process.env.CMS_POSTIZ_SHARED_SECRET;
  jest.mocked(sendTRPCMessage).mockResolvedValue({ valid: true });
});

afterEach(() => jest.restoreAllMocks());

test.each(['tenantA', 'tenantB'])(
  'signs %s identity and payload using only the existing JWT secret',
  async (tenant) => {
    const payload = { channelId: 'channelA', caption: 'Saved article' };
    await expect(
      postizBridge(tenant, 'memberA', 'validate', payload),
    ).resolves.toEqual({ valid: true });
    const call = jest.mocked(sendTRPCMessage).mock.calls[0][0];
    expect(call).toMatchObject({
      subdomain: tenant,
      pluginName: 'agent',
      module: 'postizCms',
      action: 'execute',
      method: 'mutation',
      context: { userId: 'memberA' },
      throwOnError: true,
    });
    const input = call.input as {
      body: string;
      timestamp: string;
      nonce: string;
      signature: string;
    };
    expect(JSON.parse(input.body)).toEqual({
      tenant,
      userId: 'memberA',
      action: 'validate',
      payload,
    });
    expect(input.nonce).toMatch(/^[a-f0-9]{32}$/);
    expect(Math.abs(Date.now() / 1000 - Number(input.timestamp))).toBeLessThan(
      2,
    );
    const message = [
      'cms-postiz-v1',
      input.timestamp,
      input.nonce,
      input.body,
    ].join('\n');
    expect(input.signature).toBe(
      createHmac('sha256', signingKey).update(message).digest('hex'),
    );
    expect(input.signature).not.toBe(
      createHmac('sha256', jwtSecret).update(message).digest('hex'),
    );
  },
);

test.each([undefined, '', ' \t\n'])(
  'missing or blank JWT configuration fails before transport (%s)',
  async (secret) => {
    if (secret === undefined) delete process.env.JWT_TOKEN_SECRET;
    else process.env.JWT_TOKEN_SECRET = secret;
    process.env.CMS_POSTIZ_SHARED_SECRET = 'retired-key'.repeat(8);
    await expect(
      postizBridge('tenantA', 'memberA', 'channels', {}),
    ).rejects.toThrow('not configured');
    expect(sendTRPCMessage).not.toHaveBeenCalled();
  },
);

test('retired CMS secret has no effect and each request has a fresh nonce', async () => {
  process.env.CMS_POSTIZ_SHARED_SECRET = 'unused-key'.repeat(8);
  await postizBridge('tenantA', 'memberA', 'channels', {});
  await postizBridge('tenantA', 'memberA', 'channels', {});
  const inputs = jest.mocked(sendTRPCMessage).mock.calls.map(
    ([call]) =>
      call.input as {
        body: string;
        timestamp: string;
        nonce: string;
        signature: string;
      },
  );
  expect(inputs[0].nonce).not.toBe(inputs[1].nonce);
  for (const input of inputs) {
    expect(input.signature).toBe(
      createHmac('sha256', signingKey)
        .update(
          ['cms-postiz-v1', input.timestamp, input.nonce, input.body].join(
            '\n',
          ),
        )
        .digest('hex'),
    );
  }
});
