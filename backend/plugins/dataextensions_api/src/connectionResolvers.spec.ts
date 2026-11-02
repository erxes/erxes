const loads: string[] = [];
let failNext = false;

jest.mock('erxes-api-shared/utils', () => ({
  createGenerateModels: () => async (subdomain: string) => {
    loads.push(subdomain);

    if (failNext) {
      failNext = false;
      throw new Error(`Organization with subdomain = ${subdomain} is not found`);
    }

    return { subdomain };
  },
}));

jest.mock('erxes-api-shared/core-modules', () => ({
  getDataExtensionModels: jest.fn(),
}));

import { generateModels } from './connectionResolvers';

describe('generateModels cache', () => {
  beforeEach(() => {
    loads.length = 0;
    failNext = false;
    jest.useRealTimers();
  });

  it('looks a tenant up once while the entry is fresh', async () => {
    const [a, b] = await Promise.all([
      generateModels('fresh'),
      generateModels('fresh'),
    ]);
    await generateModels('fresh');

    expect(a).toBe(b);
    expect(loads).toEqual(['fresh']);
  });

  it('keeps tenants apart', async () => {
    const a = await generateModels('tenant-a');
    const b = await generateModels('tenant-b');

    expect(a).not.toBe(b);
    expect(loads).toEqual(['tenant-a', 'tenant-b']);
  });

  it('looks the tenant up again after 30 seconds', async () => {
    jest.useFakeTimers({ now: 1_000_000 });
    await generateModels('expiring');
    jest.setSystemTime(1_000_000 + 29_999);
    await generateModels('expiring');
    jest.setSystemTime(1_000_000 + 30_000);
    await generateModels('expiring');

    expect(loads).toEqual(['expiring', 'expiring']);
  });

  it('does not keep a failed lookup', async () => {
    failNext = true;

    await expect(generateModels('new-org')).rejects.toThrow('not found');
    await expect(generateModels('new-org')).resolves.toEqual({
      subdomain: 'new-org',
    });
    expect(loads).toEqual(['new-org', 'new-org']);
  });
});
