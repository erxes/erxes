import mongoose from 'mongoose';
import { createGenerateModels } from 'erxes-api-shared/utils';

// Exercise the existing tenant resolver used by core generateModels. Mock only
// external connections/registry responses; never start MongoDB or Redis.
jest.mock('erxes-api-shared/utils', () => ({
  createGenerateModels: jest.requireActual('../../../../../erxes-api-shared/src/utils/mongo/generate-models').createGenerateModels,
}), { virtual: true });
jest.mock('../../../../../erxes-api-shared/src/utils/mongo/mongo-connection', () => ({ connect: jest.fn() }));
jest.mock('../../../../../erxes-api-shared/src/utils/utils', () => ({
  getEnv: ({ name, defaultValue }: { name: string; defaultValue?: string }) =>
    name === 'VERSION' ? mockVersion : defaultValue || '',
  getSubdomain: (value: string) => value.split('.')[0],
}));
jest.mock('../../../../../erxes-api-shared/src/utils/saas/saas-mongo-connection', () => ({
  getSaasCoreConnection: jest.fn(async () => undefined),
  coreModelOrganizations: { findOne: (selector: { subdomain: string }) => mockFindOrganization(selector) },
}));
jest.mock('../../../../../erxes-api-shared/src/core-modules/common/eventHandlers/generateEventHandlers', () => ({
  createScopedEventHandlers: jest.fn(),
}));

let mockVersion = 'saas';
const mockFindOrganization = jest.fn<Promise<{ _id: string } | null>, [{ subdomain: string }]>();

afterEach(() => jest.restoreAllMocks());

describe('unsigned capability tenant locator registry invariant', () => {
  it('rejects an unregistered SaaS locator before selecting a tenant database or loading tenant models', async () => {
    mockVersion = 'saas';
    mockFindOrganization.mockResolvedValue(null);
    const selectDatabase = jest.spyOn(mongoose.connection, 'useDb');
    const loadClasses = jest.fn(() => ({}));
    const generate = createGenerateModels(loadClasses);
    await expect(generate('random-unregistered-tenant')).rejects.toThrow('is not found');
    expect(mockFindOrganization).toHaveBeenCalledWith({ subdomain: 'random-unregistered-tenant' });
    expect(selectDatabase).not.toHaveBeenCalled();
    expect(loadClasses).not.toHaveBeenCalled();
  });

  it('derives a SaaS database name from the registered organization ID', async () => {
    mockVersion = 'saas';
    mockFindOrganization.mockResolvedValue({ _id: 'registered-org-id' });
    const selectDatabase = jest.spyOn(mongoose.connection, 'useDb').mockReturnValue(mongoose.connection);
    const loadClasses = jest.fn(() => ({}));
    await createGenerateModels(loadClasses)('tenant-a');
    expect(selectDatabase).toHaveBeenCalledWith('erxes_registered-org-id', { useCache: true, noListener: true });
    expect(loadClasses).toHaveBeenCalledWith(mongoose.connection, 'tenant-a', undefined);
  });

  it('uses the existing connection in OS mode without deriving a database from caller input', async () => {
    mockVersion = 'os';
    const selectDatabase = jest.spyOn(mongoose.connection, 'useDb');
    const loadClasses = jest.fn(() => ({}));
    await createGenerateModels(loadClasses)('random-tenant-locator');
    expect(selectDatabase).not.toHaveBeenCalled();
    expect(mockFindOrganization).not.toHaveBeenCalled();
    expect(loadClasses).toHaveBeenCalledWith(mongoose.connection, 'random-tenant-locator', undefined);
  });
});
