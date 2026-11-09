const mockEnv: Record<string, string> = {};
const mockSaasIds: Record<string, string> = { acme: 'org-acme' };

jest.mock('erxes-api-shared/utils', () => ({
  getEnv: ({ name }: { name: string }) => mockEnv[name] ?? '',
  getSaasOrganizationIdBySubdomain: async (subdomain: string) => {
    if (!mockSaasIds[subdomain])
      throw new Error(`Invalid host, subdomain: ${subdomain}`);
    return mockSaasIds[subdomain];
  },
}));

import {
  getOrganizationId,
  INSTALLATION_ID_CODE,
} from '@/organization/identity/identity';

/** Configs with a unique `code`, like the real collection. */
const configsModel = () => {
  const docs = new Map<string, { code: string; value: unknown }>();
  const lean = <T>(value: T) => ({ lean: async () => value });

  return {
    docs,
    Configs: {
      findOne: ({ code }: { code: string }) => lean(docs.get(code) ?? null),
      create: async (doc: { code: string; value: unknown }) => {
        // Yield first, so concurrent callers interleave as with a database
        await new Promise((resolve) => setImmediate(resolve));

        if (docs.has(doc.code)) {
          throw Object.assign(new Error('E11000 duplicate key'), {
            code: 11000,
          });
        }

        docs.set(doc.code, doc);
        return doc;
      },
    },
  };
};

beforeEach(() => {
  delete mockEnv.VERSION;
});

describe('organization identity', () => {
  it('is the SaaS organisation id of the subdomain', async () => {
    mockEnv.VERSION = 'saas';
    const models = configsModel();

    await expect(getOrganizationId(models as never, 'acme')).resolves.toBe(
      'org-acme',
    );
    await expect(getOrganizationId(models as never, 'nobody')).rejects.toThrow(
      'Invalid host',
    );
  });

  it('is one installation id on a self-hosted erxes, whatever the subdomain', async () => {
    const models = configsModel();

    const first = await getOrganizationId(models as never, 'localhost');
    const second = await getOrganizationId(models as never, 'hr');

    expect(first).toMatch(/^[0-9a-f-]{36}$/);
    expect(second).toBe(first);
    expect(models.docs.get(INSTALLATION_ID_CODE)?.value).toBe(first);
  });

  it('creates the installation id once when first requests arrive together', async () => {
    const models = configsModel();

    const ids = await Promise.all(
      [1, 2, 3].map(() => getOrganizationId(models as never, 'x')),
    );

    expect(new Set(ids).size).toBe(1);
    expect(models.docs.size).toBe(1);
  });
});
