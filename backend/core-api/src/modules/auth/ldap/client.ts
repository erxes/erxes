import {
  AndFilter,
  Client,
  Entry,
  EqualityFilter,
  Filter,
  FilterParser,
  InvalidCredentialsError,
  OrFilter,
} from 'ldapts';
import type {
  ILdapConfig,
  LdapServerType,
} from '@/auth/db/definitions/ldap';
import { LoginError, LoginFailureReason } from '@/auth/loginError';

export interface ILdapProfile {
  subject: string;
  dn: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  groupDns: string[];
}

export type LdapConnectionConfig = ILdapConfig & { bindPassword: string };

const SUBJECT_ATTRIBUTE: Record<LdapServerType, string> = {
  activeDirectory: 'objectGUID',
  openLdap: 'entryUUID',
};

const PROFILE_ATTRIBUTES = [
  'mail',
  'givenName',
  'sn',
  'cn',
  'displayName',
  'memberOf',
  'sAMAccountName',
  'userPrincipalName',
  'uid',
];

const firstValue = (value: Entry[string] | undefined): string => {
  const item = Array.isArray(value) ? value[0] : value;

  if (!item) {
    return '';
  }

  return Buffer.isBuffer(item) ? item.toString('utf8') : String(item);
};

const allValues = (value: Entry[string] | undefined): string[] => {
  if (!value) {
    return [];
  }

  const items: (string | Buffer)[] = Array.isArray(value) ? value : [value];

  return items.map((item) =>
    Buffer.isBuffer(item) ? item.toString('utf8') : String(item),
  );
};

const readSubject = (serverType: LdapServerType, entry: Entry): string => {
  const raw = entry[SUBJECT_ATTRIBUTE[serverType]];
  const item = Array.isArray(raw) ? raw[0] : raw;

  if (!item) {
    return '';
  }

  return Buffer.isBuffer(item) ? item.toString('hex') : String(item);
};

const toLdapProfile = (
  config: ILdapConfig,
  entry: Entry,
): ILdapProfile | null => {
  const subject = readSubject(config.serverType, entry);

  if (!subject) {
    return null;
  }

  return {
    subject,
    dn: entry.dn,
    username: firstValue(entry[config.loginAttribute]),
    email: firstValue(entry.mail).toLowerCase().trim(),
    firstName: firstValue(entry.givenName),
    lastName: firstValue(entry.sn),
    groupDns: allValues(entry.memberOf),
  };
};

export const isSecureLdapTransport = (config: Pick<ILdapConfig, 'url' | 'startTls'>) =>
  config.url.startsWith('ldaps://') ||
  (config.url.startsWith('ldap://') && config.startTls);

const buildUserFilter = (config: ILdapConfig, identifier: string): Filter => {
  const filters: Filter[] = [
    new OrFilter({
      filters: [
        new EqualityFilter({ attribute: config.loginAttribute, value: identifier }),
        new EqualityFilter({ attribute: 'mail', value: identifier }),
      ],
    }),
  ];

  if (config.userFilter) {
    filters.push(FilterParser.parseString(config.userFilter));
  }

  return new AndFilter({ filters });
};

const withServiceClient = async <T>(
  config: LdapConnectionConfig,
  run: (client: Client) => Promise<T>,
): Promise<T> => {
  if (!isSecureLdapTransport(config)) {
    throw new Error('LDAP requires ldaps:// or StartTLS');
  }

  const client = new Client({
    url: config.url,
    timeout: 10000,
    connectTimeout: 5000,
    tlsOptions: { minVersion: 'TLSv1.2' },
  });

  try {
    if (config.startTls) {
      await client.startTLS({ minVersion: 'TLSv1.2' });
    }

    await client.bind(config.bindDn, config.bindPassword);

    return await run(client);
  } finally {
    await client.unbind().catch(() => undefined);
  }
};

const findEntry = async (
  client: Client,
  config: ILdapConfig,
  identifier: string,
): Promise<Entry | null> => {
  const { searchEntries } = await client.search(config.baseDn, {
    scope: 'sub',
    filter: buildUserFilter(config, identifier),
    sizeLimit: 2,
    attributes: [...PROFILE_ATTRIBUTES, SUBJECT_ATTRIBUTE[config.serverType]],
    explicitBufferAttributes: ['objectGUID'],
  });

  // Ambiguous matches are refused rather than guessed
  return searchEntries.length === 1 ? searchEntries[0] : null;
};

/** Looks a directory user up with the service account only. */
export const lookupLdapUser = (
  config: LdapConnectionConfig,
  identifier: string,
): Promise<ILdapProfile | null> =>
  withServiceClient(config, async (client) => {
    const entry = await findEntry(client, config, identifier);

    return entry ? toLdapProfile(config, entry) : null;
  });

// AD puts the cause in the bind error text as "data <hex>"
const AD_BIND_REASONS: Record<string, LoginFailureReason> = {
  '775': 'directory_locked',
  '532': 'directory_password_expired',
  '773': 'directory_password_expired',
  '533': 'directory_disabled',
  '701': 'directory_disabled',
};

const userBindFailureReason = (error: unknown): LoginFailureReason => {
  if (!(error instanceof InvalidCredentialsError)) {
    return 'directory_unreachable';
  }

  const code = /data ([0-9a-f]+)/i.exec(error.message)?.[1];

  return (code && AD_BIND_REASONS[code]) || 'invalid_credentials';
};

/** Proves the user's password by binding as the found entry. */
export const verifyLdapCredentials = async (
  config: LdapConnectionConfig,
  identifier: string,
  password: string,
): Promise<ILdapProfile> => {
  // An empty password would be an unauthenticated bind, which servers accept
  if (!identifier || !password) {
    throw new LoginError('invalid_credentials');
  }

  try {
    return await withServiceClient(config, async (client) => {
      const entry = await findEntry(client, config, identifier);

      if (!entry) {
        throw new LoginError('invalid_credentials');
      }

      try {
        await client.bind(entry.dn, password);
      } catch (e) {
        throw new LoginError(userBindFailureReason(e));
      }

      const profile = toLdapProfile(config, entry);

      if (!profile) {
        throw new LoginError('invalid_credentials');
      }

      return profile;
    });
  } catch (e) {
    if (e instanceof LoginError) {
      throw e;
    }

    // Service bind, transport or search failures are ours, not the user's
    console.error(`LDAP sign-in failed: ${(e as Error).message}`);
    throw new LoginError('directory_unreachable');
  }
};

export const testLdapConnection = async (
  config: LdapConnectionConfig,
  identifier?: string,
): Promise<{ ok: boolean; message: string; profile?: ILdapProfile | null }> => {
  try {
    const profile = await withServiceClient(config, async (client) => {
      if (!identifier) {
        return undefined;
      }

      const entry = await findEntry(client, config, identifier);

      return entry ? toLdapProfile(config, entry) : null;
    });

    if (profile === null) {
      return { ok: false, message: 'Connected, but the user was not found', profile };
    }

    return { ok: true, message: 'Connected', profile };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Connection failed' };
  }
};
