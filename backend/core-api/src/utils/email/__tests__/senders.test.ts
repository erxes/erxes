import { createHash } from 'crypto';
import {
  EmailProviderNotSupportedError,
  getEmailProviderConfigFingerprint,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  checkFromDomain,
  isSenderAllowed,
  resolveAlignedFrom,
} from '../senders';

const mockGetConfig = jest.fn();
const mockListAuthenticatedDomains = jest.fn();
let mockConfig: Record<string, string> = {};

// the email leaves only: the whole barrel trips a circular import under jest
jest.mock('erxes-api-shared/utils', () => ({
  ...jest.requireActual('erxes-api-shared/utils/email/address'),
  ...jest.requireActual('erxes-api-shared/utils/email/config'),
  ...jest.requireActual('erxes-api-shared/utils/email/resolveProvider'),
  ...jest.requireActual('erxes-api-shared/utils/email/types'),
  getEnv: ({ name }: { name: string }) => process.env[name],
  getEmailProvider: () => ({
    listAuthenticatedDomains: (domains?: string[]) =>
      mockListAuthenticatedDomains(domains),
  }),
}));

jest.mock('@/organization/settings/utils/configs', () => ({
  getConfig: (code: string) => mockGetConfig(code),
}));

jest.mock('~/utils/email/scope', () => ({
  getScopedCacheKey: () => 'test',
  getScopedEmailConfig: async () => mockConfig,
}));

jest.mock('~/utils/email', () => ({ sendEmail: jest.fn() }));

const EmailSenders = {
  markDomain: jest.fn(),
  revokeSender: jest.fn(),
  hasActiveDomain: jest.fn(),
  listActive: jest.fn(),
};

const Users = {
  exists: jest.fn(),
  staffQuery: jest.fn(),
};

const models = { EmailSenders, Users } as unknown as IModels;

const SES_CONFIG = {
  DEFAULT_EMAIL_SERVICE: 'SES',
  AWS_REGION: 'ap-southeast-1',
};

const hashOf = (config: Record<string, string>) =>
  createHash('sha256')
    .update(getEmailProviderConfigFingerprint(config))
    .digest('hex');

const record = {
  type: 'CNAME',
  host: 'abc._domainkey.bank.mn',
  data: 'abc.dkim.amazonses.com',
  valid: false,
};

const confirmed = { ...record, valid: true };

// the provider answers the ask about named domains and the full listing apart
const provide = (asked: unknown[], listed: unknown[] = []) =>
  mockListAuthenticatedDomains.mockImplementation(async (domains?: string[]) =>
    domains ? asked : listed,
  );

beforeEach(() => {
  jest.resetAllMocks();

  delete process.env.VERSION;
  delete process.env.DEFAULT_FROM_EMAIL;

  mockConfig = SES_CONFIG;
  mockGetConfig.mockResolvedValue('noreply@bank.mn');
  EmailSenders.listActive.mockResolvedValue([]);
  EmailSenders.hasActiveDomain.mockResolvedValue(false);
  Users.exists.mockResolvedValue(null);
  Users.staffQuery.mockImplementation(async (query: object) => query);
});

describe('checkFromDomain', () => {
  it('asks the provider about the default From domain and marks it', async () => {
    mockGetConfig.mockResolvedValue('Bank <noreply@Bank.MN>');
    provide([{ status: 'verified', dnsRecords: [confirmed] }]);

    await expect(checkFromDomain(models)).resolves.toMatchObject({
      domain: 'bank.mn',
      region: 'ap-southeast-1',
      state: 'verified',
    });
    expect(mockListAuthenticatedDomains).toHaveBeenCalledWith(['bank.mn']);
    expect(EmailSenders.markDomain).toHaveBeenCalledWith(
      'bank.mn',
      'transactional',
      hashOf(SES_CONFIG),
    );
  });

  it('keeps unconfirmed records and drops the mark', async () => {
    provide([{ status: 'pending', dnsRecords: [record] }]);

    await expect(checkFromDomain(models)).resolves.toMatchObject({
      state: 'pending',
      dnsRecords: [record],
    });
    expect(EmailSenders.revokeSender).toHaveBeenCalledWith(
      'bank.mn',
      'transactional',
    );
    expect(EmailSenders.markDomain).not.toHaveBeenCalled();
  });

  it('reports a domain without DKIM tokens as missing', async () => {
    provide([{ status: 'pending', dnsRecords: [] }]);

    await expect(checkFromDomain(models)).resolves.toMatchObject({
      state: 'missing',
      region: 'ap-southeast-1',
    });
    expect(EmailSenders.revokeSender).toHaveBeenCalled();
  });

  it('reports a domain the provider does not list as missing, with no region outside SES', async () => {
    mockConfig = {
      DEFAULT_EMAIL_SERVICE: 'sendgrid',
      AWS_REGION: 'ap-southeast-1',
    };
    provide([]);

    await expect(checkFromDomain(models)).resolves.toMatchObject({
      state: 'missing',
      region: undefined,
    });
  });

  it('marks every other domain the credentials verified and drops stale marks', async () => {
    EmailSenders.listActive.mockResolvedValue([
      { type: 'domain', email: 'bank.mn' },
      { type: 'domain', email: 'old.mn' },
      { type: 'single', email: 'ann@gmail.com' },
    ]);
    provide(
      [{ status: 'verified', value: 'bank.mn', dnsRecords: [confirmed] }],
      [
        { status: 'verified', value: 'bank.mn', dnsRecords: [confirmed] },
        { status: 'verified', value: 'BankCard.mn', dnsRecords: [confirmed] },
        { status: 'pending', value: 'leasing.mn', dnsRecords: [record] },
        { status: 'verified', value: 'nodkim.mn', dnsRecords: [] },
      ],
    );

    await expect(checkFromDomain(models)).resolves.toMatchObject({
      domain: 'bank.mn',
      otherVerifiedDomains: ['bankcard.mn'],
    });
    expect(EmailSenders.markDomain).toHaveBeenCalledWith(
      'bankcard.mn',
      'transactional',
      hashOf(SES_CONFIG),
    );
    expect(EmailSenders.revokeSender).toHaveBeenCalledWith(
      'old.mn',
      'transactional',
    );
    expect(EmailSenders.revokeSender).toHaveBeenCalledTimes(1);
  });

  it('checks only the default domain when the credentials cannot list domains', async () => {
    mockListAuthenticatedDomains.mockImplementation(
      async (domains?: string[]) => {
        if (domains) {
          return [{ status: 'verified', dnsRecords: [confirmed] }];
        }

        throw new Error('AccessDenied: ses:ListIdentities');
      },
    );

    await expect(checkFromDomain(models)).resolves.toMatchObject({
      state: 'verified',
      otherVerifiedDomains: null,
      listError: 'AccessDenied: ses:ListIdentities',
    });
    expect(EmailSenders.markDomain).toHaveBeenCalledTimes(1);
    expect(EmailSenders.revokeSender).not.toHaveBeenCalled();
  });

  it('leaves the marks alone when the provider cannot be asked', async () => {
    mockListAuthenticatedDomains.mockRejectedValue(new Error('AccessDenied'));

    await expect(checkFromDomain(models)).resolves.toMatchObject({
      state: 'unchecked',
      error: 'AccessDenied',
    });
    expect(mockListAuthenticatedDomains).toHaveBeenCalledTimes(1);
    expect(EmailSenders.markDomain).not.toHaveBeenCalled();
    expect(EmailSenders.revokeSender).not.toHaveBeenCalled();
  });

  it('never marks or lists domains on a shared account', async () => {
    process.env.VERSION = 'saas';
    process.env.DEFAULT_FROM_EMAIL = 'info@erxes.io';
    provide([{ status: 'verified', dnsRecords: [confirmed] }]);

    await expect(checkFromDomain(models)).resolves.toMatchObject({
      domain: 'erxes.io',
      state: 'verified',
      otherVerifiedDomains: null,
    });
    expect(mockListAuthenticatedDomains).toHaveBeenCalledTimes(1);
    expect(EmailSenders.markDomain).not.toHaveBeenCalled();
  });

  it('skips providers that cannot authenticate domains', async () => {
    mockListAuthenticatedDomains.mockRejectedValue(
      new EmailProviderNotSupportedError('custom', 'listAuthenticatedDomains'),
    );

    await expect(checkFromDomain(models)).resolves.toBeNull();
    expect(EmailSenders.revokeSender).not.toHaveBeenCalled();
  });

  it('skips when no default From is configured', async () => {
    mockGetConfig.mockResolvedValue('');

    await expect(checkFromDomain(models)).resolves.toBeNull();
    expect(mockListAuthenticatedDomains).not.toHaveBeenCalled();
  });
});

describe('resolveAlignedFrom', () => {
  it('opens the From when the default domain is marked for these credentials', async () => {
    EmailSenders.hasActiveDomain.mockResolvedValue(true);

    await expect(resolveAlignedFrom(models)).resolves.toBeNull();
    expect(EmailSenders.hasActiveDomain).toHaveBeenCalledWith(
      'transactional',
      'bank.mn',
      hashOf(SES_CONFIG),
    );
  });

  it('keeps a requested address on the marked domain', async () => {
    EmailSenders.hasActiveDomain.mockImplementation(
      async (_scope: string, domain: string) => domain === 'bank.mn',
    );

    await expect(
      resolveAlignedFrom(models, 'transactional', 'Sales <sales@Bank.MN>'),
    ).resolves.toBeNull();
  });

  it('aligns a requested address outside the marked domain', async () => {
    EmailSenders.hasActiveDomain.mockImplementation(
      async (_scope: string, domain: string) => domain === 'bank.mn',
    );

    await expect(
      resolveAlignedFrom(models, 'transactional', 'Ann <ann@gmail.com>'),
    ).resolves.toBe('noreply@bank.mn');
  });

  it('ignores a mark confirmed with other credentials', async () => {
    const marked = hashOf(SES_CONFIG);

    EmailSenders.hasActiveDomain.mockImplementation(
      async (_scope: string, _domain: string, hash: string) => hash === marked,
    );
    mockConfig = { ...SES_CONFIG, AWS_SES_ACCESS_KEY_ID: 'rotated' };

    await expect(resolveAlignedFrom(models)).resolves.toBe('noreply@bank.mn');
  });
});

describe('isSenderAllowed', () => {
  it('accepts an address on a marked domain without asking the provider', async () => {
    EmailSenders.hasActiveDomain.mockResolvedValue(true);

    await expect(isSenderAllowed(models, 'sales@bank.mn')).resolves.toBe(true);
    expect(mockListAuthenticatedDomains).not.toHaveBeenCalled();
  });

  it('accepts the default sender without asking the provider', async () => {
    await expect(isSenderAllowed(models, 'NoReply@bank.mn')).resolves.toBe(
      true,
    );
    expect(mockListAuthenticatedDomains).not.toHaveBeenCalled();
  });

  it('asks about an unmarked domain once and keeps the answer as a mark', async () => {
    provide([
      { status: 'verified', value: 'bankcard.mn', dnsRecords: [confirmed] },
    ]);

    await expect(isSenderAllowed(models, 'promo@bankcard.mn')).resolves.toBe(
      true,
    );
    expect(mockListAuthenticatedDomains).toHaveBeenCalledWith(['bankcard.mn']);
    expect(EmailSenders.markDomain).toHaveBeenCalledWith(
      'bankcard.mn',
      'transactional',
      hashOf(SES_CONFIG),
    );
  });

  it('refuses an unmarked domain the provider has not verified', async () => {
    provide([{ status: 'pending', dnsRecords: [record] }]);

    await expect(isSenderAllowed(models, 'promo@bankcard.mn')).resolves.toBe(
      false,
    );
    expect(EmailSenders.markDomain).not.toHaveBeenCalled();
  });

  it("never lets a shared account's verification through", async () => {
    process.env.VERSION = 'saas';
    provide([{ status: 'verified', dnsRecords: [confirmed] }]);

    await expect(isSenderAllowed(models, 'sales@msmgroup.mn')).resolves.toBe(
      false,
    );
    expect(EmailSenders.markDomain).not.toHaveBeenCalled();
  });

  it('refuses a placeholder address on a marked domain no team member has', async () => {
    EmailSenders.hasActiveDomain.mockResolvedValue(true);

    await expect(
      isSenderAllowed(models, 'ceo@bank.mn', 'transactional', {
        fromPlaceholder: true,
      }),
    ).resolves.toBe(false);
    expect(EmailSenders.hasActiveDomain).not.toHaveBeenCalled();
    expect(mockListAuthenticatedDomains).not.toHaveBeenCalled();
  });

  it("accepts a placeholder that gives a team member's address", async () => {
    Users.exists.mockResolvedValue({ _id: 'bat' });

    await expect(
      isSenderAllowed(models, 'Bat@Gmail.com', 'transactional', {
        fromPlaceholder: true,
      }),
    ).resolves.toBe(true);
    expect(Users.staffQuery).toHaveBeenCalledWith({
      email: 'bat@gmail.com',
      isActive: { $ne: false },
    });
  });

  it('accepts a placeholder that gives a verified sender', async () => {
    EmailSenders.listActive.mockResolvedValue([{ email: 'agency@studio.mn' }]);

    await expect(
      isSenderAllowed(models, 'agency@studio.mn', 'transactional', {
        fromPlaceholder: true,
      }),
    ).resolves.toBe(true);
    expect(Users.exists).not.toHaveBeenCalled();
  });
});
