const mockRedis = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
const mockGetActivePlugins = jest.fn();
const mockGetPlugin = jest.fn();
const mockSendTRPCMessage = jest.fn();

jest.mock('../../utils', () => ({
  redis: mockRedis,
  getActivePlugins: (...args: unknown[]) => mockGetActivePlugins(...args),
  getPlugin: (...args: unknown[]) => mockGetPlugin(...args),
  sendTRPCMessage: (...args: unknown[]) => mockSendTRPCMessage(...args),
  ExpectedError: class ExpectedError extends Error {},
}));

import type { IUserDocument } from '../../core-types';
import { checkPermissionGroup, resolveActionOAuthScopes } from './utils';

const user = (overrides: Record<string, unknown> = {}) =>
  ({
    _id: 'user-1',
    permissionGroupIds: [],
    customPermissions: [],
    ...overrides,
  }) as unknown as IUserDocument;

const salesPlugin = {
  config: {
    meta: {
      permissions: {
        modules: [
          {
            name: 'deal',
            actions: [
              { name: 'showDeals', title: 'Show deals', description: '' },
              { name: 'dealsAdd', title: 'Add deals', description: '' },
            ],
          },
        ],
      },
    },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockRedis.get.mockResolvedValue(null);
  mockRedis.set.mockResolvedValue(undefined);
  mockRedis.del.mockResolvedValue(undefined);
  mockGetActivePlugins.mockResolvedValue(['sales']);
  mockGetPlugin.mockResolvedValue(salesPlugin);
  mockSendTRPCMessage.mockResolvedValue([]);
});

describe('oauth scopes for plugin actions', () => {
  it('keeps declared scopes and derives a module scope when none is declared', () => {
    expect(
      resolveActionOAuthScopes(
        'core',
        { name: 'contact' },
        { oauthScope: 'contacts:read' },
      ),
    ).toEqual(['contacts:read']);
    expect(
      resolveActionOAuthScopes(
        'core',
        { name: 'contact' },
        { oauthScopes: ['contacts:read', 'contacts:create'] },
      ),
    ).toEqual(['contacts:read', 'contacts:create']);
    expect(resolveActionOAuthScopes('sales', { name: 'deal' }, {})).toEqual([
      'sales:deal',
    ]);
  });

  it('lets an oauth token with the derived module scope call plugin actions', async () => {
    const check = checkPermissionGroup(
      'sub',
      user({ isOwner: true, oauthScopes: ['sales:deal'] }),
    );
    await expect(check('dealsAdd')).resolves.toBeUndefined();
  });

  it('still rejects an oauth token that lacks the module scope', async () => {
    const check = checkPermissionGroup(
      'sub',
      user({ isOwner: true, oauthScopes: ['contacts:read'] }),
    );
    await expect(check('dealsAdd')).rejects.toThrow('OAuth scope required');
  });

  it('does not scope-check non-oauth sessions', async () => {
    const check = checkPermissionGroup('sub', user({ isOwner: true }));
    await expect(check('dealsAdd')).resolves.toBeUndefined();
  });
});
