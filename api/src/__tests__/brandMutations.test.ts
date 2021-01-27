import { graphqlRequest } from '../db/connection';
import { brandFactory, integrationFactory } from '../db/factories';
import { Brands, Integrations, Users } from '../db/models';
import memoryStorage from '../inmemoryStorage';
import './setup.ts';

describe('Brands mutations', () => {
  let _brand;
  let _integration;

  const commonParamDefs = `
    $name: String!
    $description: String!
  `;

  const commonParams = `
    name: $name
    description: $description
  `;

  beforeEach(async () => {
    // Creating test data
    _brand = await brandFactory({});
    _integration = await integrationFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Brands.deleteMany({});
    await Users.deleteMany({});
    await Integrations.deleteMany({});

    memoryStorage().removeKey(`erxes_brand_${_brand.code}`);
  });

  test('Create brand', async () => {
    const args = {
      name: _brand.name,
      description: _brand.description
    };

    const mutation = `
      mutation brandsAdd(${commonParamDefs}) {
        brandsAdd(${commonParams}) {
          _id
          name
          description
        }
      }
    `;

    const brand = await graphqlRequest(mutation, 'brandsAdd', args);

    expect(brand.name).toEqual(args.name);
    expect(brand.description).toEqual(args.description);
  });

  test('Update brand', async () => {
    const args = {
      _id: _brand._id,
      name: 'name',
      description: 'Soem texte'
    };

    const mutation = `
      mutation brandsEdit($_id: String!, ${commonParamDefs}) {
        brandsEdit(_id: $_id, ${commonParams}) {
          _id
          name
          description
        }
      }
    `;

    const brand = await graphqlRequest(mutation, 'brandsEdit', args);

    expect(brand.name).toBe(args.name);
    expect(brand.description).toBe(args.description);

    const storageKey = `erxes_brand_${_brand.code}`;

    let cachedBrand = await memoryStorage().get(storageKey);

    expect(cachedBrand).toBeUndefined();

    // create brand cache =====================
    memoryStorage().set(storageKey, JSON.stringify(_brand));

    await graphqlRequest(mutation, 'brandsEdit', args);

    cachedBrand =
      JSON.parse((await memoryStorage().get(storageKey)) || '{}') || {};

    expect(Object.keys(cachedBrand).length > 0).toBe(true);
  });

  test('Remove brand', async () => {
    const mutation = `
      mutation brandsRemove($_id: String!) {
        brandsRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'brandsRemove', { _id: _brand._id });

    expect(await Brands.findOne({ _id: _brand._id })).toBe(null);

    // Remove brand, lead, messenger cache ==============
    const brand = await brandFactory({ code: '233la' });
    const messenger = await integrationFactory({
      brandId: brand._id,
      kind: 'messenger'
    });
    const lead = await integrationFactory({ brandId: brand._id, kind: 'lead' });

    const storageBrandKey = `erxes_brand_${brand.code}`;
    const storageMessengerKey = `erxes_integration_messenger_${brand._id}`;
    const storageLeadKey = `erxes_integration_lead_${brand._id}`;

    memoryStorage().set(storageBrandKey, JSON.stringify(brand));
    memoryStorage().set(storageMessengerKey, JSON.stringify(messenger));
    memoryStorage().set(storageLeadKey, JSON.stringify(lead));

    await graphqlRequest(mutation, 'brandsRemove', { _id: brand._id });

    expect(await Brands.findOne({ _id: brand._id })).toBe(null);

    const hasCache = async key => {
      const result = JSON.parse((await memoryStorage().get(key)) || '{}') || {};

      return Object.keys(result).length > 0;
    };

    expect(await hasCache(storageBrandKey)).toBe(false);
    expect(await hasCache(storageMessengerKey)).toBe(false);
    expect(await hasCache(storageLeadKey)).toBe(false);
  });

  test('Manage brand integrations', async () => {
    const args = {
      _id: _brand._id,
      integrationIds: [_integration._id]
    };

    const mutation = `
      mutation brandsManageIntegrations($_id: String!, $integrationIds: [String]!) {
        brandsManageIntegrations(_id: $_id, integrationIds: $integrationIds) {
          _id
          brandId
        }
      }
    `;

    const [integration] = await graphqlRequest(
      mutation,
      'brandsManageIntegrations',
      args
    );

    expect(integration.brandId).toBe(args._id);
  });
});
