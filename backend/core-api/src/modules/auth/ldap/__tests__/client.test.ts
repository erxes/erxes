/**
 * LDAP client contract: secure transport only, one unambiguous entry, the
 * user's own bind proves the password, and the connection always closes.
 */
import { Client, InvalidCredentialsError } from 'ldapts';
import {
  isSecureLdapTransport,
  LdapConnectionConfig,
  lookupLdapUser,
  readDirectoryStates,
  verifyLdapCredentials,
} from '@/auth/ldap/client';

jest.mock('ldapts', () => {
  const actual = jest.requireActual('ldapts');

  return {
    ...actual,
    Client: jest.fn(),
  };
});

const mockedClient = Client as unknown as jest.Mock;

const config: LdapConnectionConfig = {
  enabled: true,
  serverType: 'activeDirectory',
  url: 'ldaps://dc.example.local',
  startTls: false,
  bindDn: 'CN=svc,DC=example,DC=local',
  bindPassword: 'service-secret',
  baseDn: 'DC=example,DC=local',
  loginAttribute: 'sAMAccountName',
  allowedGroupDns: [],
  linkEmailDomains: [],
  groupMappings: [],
  recheckEveryMinutes: 15,
  groupChangePolicy: 'updatePermissions',
};

const entry = {
  dn: 'CN=Bat,OU=Sales,DC=example,DC=local',
  objectGUID: Buffer.from('0102', 'hex'),
  sAMAccountName: 'bat',
  mail: 'Bat@Example.com',
  givenName: 'Bat',
  sn: 'Dorj',
  memberOf: ['CN=Sales,OU=Groups,DC=example,DC=local'],
};

const setupClient = (searchEntries: object[]) => {
  const client = {
    startTLS: jest.fn().mockResolvedValue(undefined),
    bind: jest.fn().mockResolvedValue(undefined),
    search: jest.fn().mockResolvedValue({ searchEntries }),
    unbind: jest.fn().mockResolvedValue(undefined),
  };

  mockedClient.mockImplementation(() => client);

  return client;
};

afterEach(() => {
  mockedClient.mockReset();
});

describe('isSecureLdapTransport', () => {
  it('accepts ldaps and ldap with StartTLS only', () => {
    expect(isSecureLdapTransport({ url: 'ldaps://x', startTls: false })).toBe(
      true,
    );
    expect(isSecureLdapTransport({ url: 'ldap://x', startTls: true })).toBe(
      true,
    );
    expect(isSecureLdapTransport({ url: 'ldap://x', startTls: false })).toBe(
      false,
    );
  });
});

describe('verifyLdapCredentials', () => {
  it('binds as the found entry and returns a normalized profile', async () => {
    const client = setupClient([entry]);

    const profile = await verifyLdapCredentials(config, 'bat', 'user-secret');

    expect(client.bind).toHaveBeenNthCalledWith(
      1,
      config.bindDn,
      'service-secret',
    );
    expect(client.bind).toHaveBeenNthCalledWith(2, entry.dn, 'user-secret');
    expect(client.unbind).toHaveBeenCalled();
    expect(profile).toEqual({
      subject: '0102',
      dn: entry.dn,
      username: 'bat',
      email: 'bat@example.com',
      firstName: 'Bat',
      lastName: 'Dorj',
      groupDns: entry.memberOf,
    });
  });

  it('never contacts the server with an empty password', async () => {
    setupClient([entry]);

    await expect(
      verifyLdapCredentials(config, 'bat', ''),
    ).rejects.toMatchObject({
      reason: 'invalid_credentials',
    });
    expect(mockedClient).not.toHaveBeenCalled();
  });

  it('refuses ambiguous matches', async () => {
    const client = setupClient([entry, { ...entry, dn: 'CN=Other' }]);

    await expect(
      verifyLdapCredentials(config, 'bat', 'user-secret'),
    ).rejects.toMatchObject({ reason: 'invalid_credentials' });
    expect(client.bind).toHaveBeenCalledTimes(1);
    expect(client.unbind).toHaveBeenCalled();
  });

  const rejectUserBind = (error: Error) => {
    const client = setupClient([entry]);
    client.bind.mockResolvedValueOnce(undefined).mockRejectedValueOnce(error);

    return client;
  };

  const adBindError = (data: string) =>
    new InvalidCredentialsError(
      `80090308: LdapErr: DSID-0C09044E, comment: AcceptSecurityContext error, data ${data}, v4563`,
    );

  it('reports a wrong password and closes the connection', async () => {
    const client = rejectUserBind(adBindError('52e'));

    await expect(
      verifyLdapCredentials(config, 'bat', 'wrong'),
    ).rejects.toMatchObject({
      reason: 'invalid_credentials',
    });
    expect(client.unbind).toHaveBeenCalled();
  });

  it.each([
    ['775', 'directory_locked'],
    ['532', 'directory_password_expired'],
    ['773', 'directory_password_expired'],
    ['533', 'directory_disabled'],
    ['701', 'directory_disabled'],
  ])('maps AD bind code %s to %s', async (data, reason) => {
    rejectUserBind(adBindError(data));

    await expect(
      verifyLdapCredentials(config, 'bat', 'pw'),
    ).rejects.toMatchObject({
      reason,
    });
  });

  it('reports a failing server, not a wrong password', async () => {
    rejectUserBind(new Error('connect ECONNREFUSED'));

    await expect(
      verifyLdapCredentials(config, 'bat', 'pw'),
    ).rejects.toMatchObject({
      reason: 'directory_unreachable',
    });
  });

  it('reports a rejected service account as unreachable', async () => {
    const client = setupClient([entry]);
    client.bind.mockRejectedValueOnce(adBindError('52e'));

    await expect(
      verifyLdapCredentials(config, 'bat', 'pw'),
    ).rejects.toMatchObject({
      reason: 'directory_unreachable',
    });
  });

  it('refuses a plain ldap url without StartTLS', async () => {
    setupClient([entry]);

    const insecure = { ...config, url: 'ldap://dc.example.local' };

    await expect(
      verifyLdapCredentials(insecure, 'bat', 'user-secret'),
    ).rejects.toMatchObject({ reason: 'directory_unreachable' });
    expect(mockedClient).not.toHaveBeenCalled();
  });

  it('upgrades with StartTLS before binding', async () => {
    const client = setupClient([entry]);

    await verifyLdapCredentials(
      { ...config, url: 'ldap://dc.example.local', startTls: true },
      'bat',
      'user-secret',
    );

    expect(client.startTLS).toHaveBeenCalled();
    expect(client.startTLS.mock.invocationCallOrder[0]).toBeLessThan(
      client.bind.mock.invocationCallOrder[0],
    );
  });
});

describe('lookupLdapUser', () => {
  it('reads the profile with the service account only', async () => {
    const client = setupClient([entry]);

    const profile = await lookupLdapUser(config, 'bat@example.com');

    expect(client.bind).toHaveBeenCalledTimes(1);
    expect(profile?.subject).toBe('0102');
  });

  it('reads OpenLDAP entryUUID as the subject', async () => {
    setupClient([
      {
        dn: 'uid=bat,ou=people,dc=example',
        entryUUID: 'a-b-c',
        uid: 'bat',
        mail: 'bat@example.com',
      },
    ]);

    const profile = await lookupLdapUser(
      { ...config, serverType: 'openLdap', loginAttribute: 'uid' },
      'bat',
    );

    expect(profile?.subject).toBe('a-b-c');
    expect(profile?.username).toBe('bat');
  });
});

describe('readDirectoryStates', () => {
  it('returns each found user by subject with groups and the AD disabled bit', async () => {
    const client = setupClient([
      { ...entry, userAccountControl: '514' },
      {
        dn: 'CN=Dulmaa,OU=Sales,DC=example,DC=local',
        objectGUID: Buffer.from('0304', 'hex'),
        userAccountControl: '512',
      },
    ]);

    const states = await readDirectoryStates(config, ['0102', '0304', '0506']);

    expect(states.get('0102')).toEqual({
      groupDns: ['CN=Sales,OU=Groups,DC=example,DC=local'],
      disabled: true,
    });
    expect(states.get('0304')).toEqual({ groupDns: [], disabled: false });
    expect(states.has('0506')).toBe(false);
    expect(client.unbind).toHaveBeenCalled();
  });

  it('asks in one paged search, matching AD GUIDs as raw bytes', async () => {
    const client = setupClient([]);

    await readDirectoryStates(config, ['0102', '0304']);

    expect(client.search).toHaveBeenCalledTimes(1);
    const [, options] = client.search.mock.calls[0];
    expect(options.paged).toBe(true);
    expect(options.filter.toString()).toBe(
      '(|(objectGUID=\\01\\02)(objectGUID=\\03\\04))',
    );
  });

  it('skips the directory entirely when nobody is linked', async () => {
    const client = setupClient([]);

    await expect(readDirectoryStates(config, [])).resolves.toEqual(new Map());
    expect(client.bind).not.toHaveBeenCalled();
  });

  it('lets connection failures reach the caller', async () => {
    const client = setupClient([]);
    client.bind.mockRejectedValue(new Error('connect ECONNREFUSED'));

    await expect(readDirectoryStates(config, ['0102'])).rejects.toThrow(
      'ECONNREFUSED',
    );
  });
});
