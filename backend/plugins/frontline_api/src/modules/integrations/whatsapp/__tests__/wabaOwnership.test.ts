import mongoose, { mongo } from 'mongoose';
import { isSaas } from '../config';
import {
  WABA_OWNED_ELSEWHERE_MESSAGE,
  assertWabaAvailable,
  claimWaba,
  releaseWaba,
} from '../wabaOwnership';

jest.mock('../config', () => ({ isSaas: jest.fn() }));

const owners = {
  create: jest.fn(),
  findById: jest.fn(),
  deleteOne: jest.fn(),
};
const ownedBy = (subdomain?: string) =>
  owners.findById.mockReturnValue({
    lean: jest.fn().mockResolvedValue(subdomain ? { subdomain } : null),
  });
const duplicateKey = () =>
  Object.assign(new mongo.MongoServerError({ message: 'E11000' }), {
    code: 11000,
  });

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(isSaas).mockReturnValue(true);
  jest.spyOn(mongoose.connection, 'useDb').mockReturnValue({
    models: { whatsapp_waba_owners: owners },
  } as never);
});

describe('WABA ownership on SaaS', () => {
  it('claims a free WABA for the workspace', async () => {
    await claimWaba('waba-1', 'tenant-a');

    expect(owners.create).toHaveBeenCalledWith({
      _id: 'waba-1',
      subdomain: 'tenant-a',
    });
  });

  it('accepts a claim the workspace already holds', async () => {
    owners.create.mockRejectedValueOnce(duplicateKey());
    ownedBy('tenant-a');

    await expect(claimWaba('waba-1', 'tenant-a')).resolves.toBeUndefined();
  });

  it('refuses a WABA another workspace owns, including a lost race', async () => {
    owners.create.mockRejectedValueOnce(duplicateKey());
    ownedBy('tenant-b');

    await expect(claimWaba('waba-1', 'tenant-a')).rejects.toThrow(
      WABA_OWNED_ELSEWHERE_MESSAGE,
    );
    await expect(assertWabaAvailable('waba-1', 'tenant-a')).rejects.toThrow(
      WABA_OWNED_ELSEWHERE_MESSAGE,
    );
  });

  it('releases only its own claim', async () => {
    await releaseWaba('waba-1', 'tenant-a');

    expect(owners.deleteOne).toHaveBeenCalledWith({
      _id: 'waba-1',
      subdomain: 'tenant-a',
    });
  });
});

describe('WABA ownership when self-hosted', () => {
  it('records nothing and never refuses', async () => {
    jest.mocked(isSaas).mockReturnValue(false);

    await claimWaba('waba-1', 'os');
    await assertWabaAvailable('waba-1', 'os');
    await releaseWaba('waba-1', 'os');

    expect(mongoose.connection.useDb).not.toHaveBeenCalled();
  });
});
