import { GraphQLResolveInfo } from 'graphql';
import { markResolvers, wrapApolloResolvers } from './wrapperResolvers';

jest.mock('../logs', () => ({
  logHandler: jest.fn(async (resolver: () => unknown) => resolver()),
}));

jest.mock('../../core-modules/permissions/utils', () => ({
  wrapPermission: (resolver: (...args: unknown[]) => unknown) => resolver,
  wrapPublicResolver: (resolver: (...args: unknown[]) => unknown) => resolver,
}));

jest.mock('@sentry/node', () => ({ withScope: jest.fn() }));

jest.mock('./runBeforeResolvers', () => ({
  runBeforeResolvers: jest.fn(async (_key: string, args: unknown) => ({
    resolved: false,
    args,
  })),
}));

const { logHandler } = jest.requireMock('../logs') as {
  logHandler: jest.Mock;
};
const { runBeforeResolvers } = jest.requireMock('./runBeforeResolvers') as {
  runBeforeResolvers: jest.Mock;
};

const context = {
  subdomain: 'tenant',
  user: { _id: 'u1' },
  req: { headers: {} },
};
const info = { fieldName: 'secretSave' } as GraphQLResolveInfo;
const args = { value: 'sk-secret' };

describe('wrapApolloResolvers sensitiveArgs', () => {
  beforeEach(() => {
    logHandler.mockClear();
    runBeforeResolvers.mockClear();
  });

  it('logs arguments and runs before-resolver hooks by default', async () => {
    const mutations = { plainSave: async () => 'ok' };
    const wrapped = wrapApolloResolvers({ Mutation: mutations });

    await wrapped.Mutation.plainSave({}, args, context, info);

    expect(logHandler.mock.calls[0][1].payload.args).toEqual(args);
    expect(runBeforeResolvers).toHaveBeenCalled();
  });

  it('keeps sensitive arguments out of logs and hooks', async () => {
    const mutations = { secretSave: async () => 'ok' };
    markResolvers(mutations, { wrapperConfig: { sensitiveArgs: true } });
    const wrapped = wrapApolloResolvers({ Mutation: mutations });

    await expect(
      wrapped.Mutation.secretSave({}, args, context, info),
    ).resolves.toBe('ok');

    const payload = logHandler.mock.calls[0][1].payload;

    expect(payload).not.toHaveProperty('args');
    expect(payload.argsRedacted).toBe(true);
    expect(JSON.stringify(logHandler.mock.calls)).not.toContain('sk-secret');
    expect(runBeforeResolvers).not.toHaveBeenCalled();
  });
});
