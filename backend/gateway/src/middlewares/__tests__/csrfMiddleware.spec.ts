const mockOrganization: { domain?: string; dnsStatus?: string } = {};

jest.mock('erxes-api-shared/utils', () => ({
  getSaasOrganizationDetail: async () => mockOrganization,
}));

jest.mock('../../util/subdomain', () => ({
  getSubdomain: () => 'bank',
}));

import { csrfMiddleware } from '../csrfMiddleware';

const ALLOWED = ['https://app.erxes.io', /^https:\/\/.*\.trusted\.mn$/];

const SID = { 'erxes-sid': 'sid-value' };

const run = async ({
  method = 'POST',
  cookies = SID,
  headers = {},
}: {
  method?: string;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
}) => {
  let status = 0;
  const req = { method, cookies, headers } as never;
  const res = {
    status: (code: number) => {
      status = code;
      return { json: () => undefined };
    },
  } as never;
  const next = jest.fn();

  await csrfMiddleware(ALLOWED)(req, res, next);

  return { blocked: status === 403, passed: next.mock.calls.length === 1 };
};

beforeEach(() => {
  delete process.env.VERSION;
  delete mockOrganization.domain;
  delete mockOrganization.dnsStatus;
});

describe('blocks cross-site requests that carry a staff cookie', () => {
  it('blocks the device-approve form post from an attacker page', async () => {
    const result = await run({
      headers: {
        origin: 'https://evil.example',
        'sec-fetch-site': 'cross-site',
        'content-type': 'application/x-www-form-urlencoded',
      },
    });

    expect(result).toEqual({ blocked: true, passed: false });
  });

  it('blocks an unknown origin from a browser without Sec-Fetch-Site', async () => {
    const result = await run({ headers: { origin: 'https://evil.example' } });

    expect(result.blocked).toBe(true);
  });

  it('blocks a legacy auth-token cookie the same way', async () => {
    const result = await run({
      cookies: { 'auth-token': 'jwt' },
      headers: { origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' },
    });

    expect(result.blocked).toBe(true);
  });

  it('blocks a lookalike of an allowed origin', async () => {
    const result = await run({
      headers: {
        origin: 'https://app.erxes.io.evil.example',
        'sec-fetch-site': 'cross-site',
      },
    });

    expect(result.blocked).toBe(true);
  });

  it('blocks an unparseable origin in SaaS', async () => {
    process.env.VERSION = 'saas';
    mockOrganization.domain = 'crm.bank.mn';
    mockOrganization.dnsStatus = 'active';

    const result = await run({
      headers: { origin: 'null', 'sec-fetch-site': 'cross-site' },
    });

    expect(result.blocked).toBe(true);
  });

  it('blocks a custom domain whose DNS is not active yet', async () => {
    process.env.VERSION = 'saas';
    mockOrganization.domain = 'crm.bank.mn';
    mockOrganization.dnsStatus = 'pending';

    const result = await run({
      headers: { origin: 'https://crm.bank.mn', 'sec-fetch-site': 'cross-site' },
    });

    expect(result.blocked).toBe(true);
  });
});

describe('lets legitimate traffic through', () => {
  it.each(['same-origin', 'same-site', 'none'])(
    'passes Sec-Fetch-Site: %s',
    async (site) => {
      const result = await run({
        headers: { origin: 'https://whatever.example', 'sec-fetch-site': site },
      });

      expect(result).toEqual({ blocked: false, passed: true });
    },
  );

  it('passes a cross-site origin from the CORS list', async () => {
    const result = await run({
      headers: { origin: 'https://app.erxes.io', 'sec-fetch-site': 'cross-site' },
    });

    expect(result.passed).toBe(true);
  });

  it('passes a cross-site origin matching a CORS pattern', async () => {
    const result = await run({
      headers: { origin: 'https://crm.trusted.mn', 'sec-fetch-site': 'cross-site' },
    });

    expect(result.passed).toBe(true);
  });

  it("passes the SaaS tenant's own active custom domain", async () => {
    process.env.VERSION = 'saas';
    mockOrganization.domain = 'crm.bank.mn';
    mockOrganization.dnsStatus = 'active';

    const result = await run({
      headers: { origin: 'https://crm.bank.mn', 'sec-fetch-site': 'cross-site' },
    });

    expect(result.passed).toBe(true);
  });

  it('passes safe methods', async () => {
    const result = await run({
      method: 'GET',
      headers: { origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' },
    });

    expect(result.passed).toBe(true);
  });

  it('passes requests without a staff cookie', async () => {
    const result = await run({
      cookies: { 'client-auth-token': 'cp' },
      headers: { origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' },
    });

    expect(result.passed).toBe(true);
  });

  it('passes non-browser clients that send no Origin', async () => {
    const result = await run({ headers: {} });

    expect(result.passed).toBe(true);
  });
});
