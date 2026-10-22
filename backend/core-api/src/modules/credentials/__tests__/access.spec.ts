import { authorizeCredentialManagement } from '../access';
import type { CredentialAccessDependencies, CredentialPermission, CredentialPermissionEntry, CredentialPrincipal } from '../access';

const permission = (actions = ['credentialsRead']): CredentialPermissionEntry => ({
  plugin: 'core', module: 'credentials', scope: 'all', actions,
});
const dependencies = (user: CredentialPrincipal | null = {
  _id: 'user-a', isActive: true, customPermissions: [permission()],
}): CredentialAccessDependencies => ({
  verifySession: jest.fn(async () => 'user-a'),
  sessionIsActive: jest.fn(async () => true),
  findUser: jest.fn(async () => user),
  groupPermissions: jest.fn(async () => []),
});

describe('credential management authorization', () => {
  it.each(['credentialsRead', 'credentialsManage', 'credentialGrantsManage'] as CredentialPermission[])(
    'requires its explicit permission for %s', async (action) => {
      const deps = dependencies({ _id: 'user-a', isActive: true, customPermissions: [permission([action])] });
      expect((await authorizeCredentialManagement('tenant-a', 'session', action, deps))._id).toBe('user-a');
      expect(deps.sessionIsActive).toHaveBeenCalledWith('user-a', 'session');
      expect(deps.findUser).toHaveBeenCalledWith('user-a');
    },
  );

  it('supports current tenant groups and authenticated active owners', async () => {
    const grouped = dependencies({ _id: 'user-a', isActive: true, permissionGroupIds: ['tenant-group'] });
    grouped.groupPermissions = jest.fn(async () => [permission(['credentialsManage'])]);
    await expect(authorizeCredentialManagement('tenant-a', 'session', 'credentialsManage', grouped)).resolves.toMatchObject({ _id: 'user-a' });
    expect(grouped.groupPermissions).toHaveBeenCalledWith(['tenant-group']);
    await expect(authorizeCredentialManagement('tenant-a', 'session', 'credentialsManage',
      dependencies({ _id: 'user-a', isOwner: true, isActive: true }))).resolves.toMatchObject({ isOwner: true });
  });

  it.each([
    null,
    { _id: 'other-user', isActive: true, isOwner: true },
    { _id: 'user-a', isActive: false, isOwner: true },
    { _id: 'user-a', isActive: true, appId: 'app', isOwner: true },
    { _id: 'user-a', isActive: true },
    { _id: 'user-a', isActive: true, customPermissions: [{ ...permission(), module: 'contacts' }] },
    { _id: 'user-a', isActive: true, customPermissions: [{ ...permission(), plugin: 'optional' }] },
    { _id: 'user-a', isActive: true, customPermissions: [{ ...permission(), scope: 'own' }] },
  ])('denies absent, foreign, inactive, app and unprivileged principals (%#)', async (user) => {
    await expect(authorizeCredentialManagement('tenant-a', 'session', 'credentialsRead', dependencies(user))).rejects.toThrow('Credential access denied');
  });

  it('denies missing/invalid sessions before reading users or group permissions', async () => {
    const deps = dependencies();
    for (const [tenant, token] of [['../tenant', 'session'], ['tenant-a', ''], ['tenant-a', 'x'.repeat(8193)]]) {
      await expect(authorizeCredentialManagement(tenant, token, 'credentialsRead', deps)).rejects.toThrow('Credential access denied');
    }
    expect(deps.verifySession).not.toHaveBeenCalled();
    deps.sessionIsActive = jest.fn(async () => false);
    await expect(authorizeCredentialManagement('tenant-a', 'revoked-session', 'credentialsRead', deps)).rejects.toThrow('Credential access denied');
    expect(deps.findUser).not.toHaveBeenCalled();
    expect(deps.groupPermissions).not.toHaveBeenCalled();
  });

  it('does not reuse permissions across tenants or requests after permission revocation', async () => {
    const deps = dependencies();
    await expect(authorizeCredentialManagement('tenant-a', 'session', 'credentialsRead', deps)).resolves.toBeDefined();
    deps.findUser = jest.fn(async () => null);
    await expect(authorizeCredentialManagement('tenant-b', 'session', 'credentialsRead', deps)).rejects.toThrow('Credential access denied');
    deps.findUser = jest.fn(async () => ({ _id: 'user-a', isActive: true }));
    await expect(authorizeCredentialManagement('tenant-a', 'session', 'credentialsRead', deps)).rejects.toThrow('Credential access denied');
    await expect(authorizeCredentialManagement('tenant-a', 'session', 'credentialGrantsManage', dependencies())).rejects.toThrow('Credential access denied');
  });
});
