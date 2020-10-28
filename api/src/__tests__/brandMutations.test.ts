import { graphqlRequest } from '../db/connection';
import { brandFactory, integrationFactory } from '../db/factories';
import { Brands, Integrations, Users } from '../db/models';

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
  });

  test('Remove brand', async () => {
    const mutation = `
      mutation brandsRemove($_id: String!) {
        brandsRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'brandsRemove', { _id: _brand._id });

    expect(await Brands.findOne({ _id: _brand._id })).toBe(null);
  });

  test('Config email brand', async () => {
    const args = {
      _id: _brand._id,
      emailConfig: _brand.emailConfig
    };

    const mutation = `
      mutation brandsConfigEmail($_id: String!, $emailConfig: JSON) {
        brandsConfigEmail(_id: $_id, emailConfig: $emailConfig){
          _id
          emailConfig
        }
      }
    `;

    const brand = await graphqlRequest(mutation, 'brandsConfigEmail', args);

    expect(brand._id).toBe(args._id);
    expect(brand.emailConfig.toJSON()).toEqual(args.emailConfig.toJSON());
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
