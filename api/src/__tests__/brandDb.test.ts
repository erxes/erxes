import { brandFactory, integrationFactory, userFactory } from '../db/factories';
import { Brands, Integrations, Users } from '../db/models';

import './setup.ts';

describe('Brands db', () => {
  let _brand;
  let _user;

  beforeEach(async () => {
    // Creating test data
    _brand = await brandFactory({});
    _user = await userFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Brands.deleteMany({});
    await Users.deleteMany({});
  });

  test('Generate code', async () => {
    // try using exisiting one
    let code = await Brands.generateCode(_brand.code);
    expect(code).not.toBe(_brand.code);
    expect(code).toBeDefined();

    // try using not existing one
    code = await Brands.generateCode('DFAFFADFSF');
    expect(code).toBeDefined();
  });

  test('Get brand', async () => {
    try {
      await Brands.getBrand('fakeId');
    } catch (e) {
      expect(e.message).toBe('Brand not found');
    }

    const brandObj = await Brands.getBrand(_brand._id);

    expect(brandObj).toBeDefined();
  });

  test('Create brand', async () => {
    const brandObj = await Brands.createBrand({
      name: _brand.name,
      description: _brand.description,
      userId: _user._id
    });

    expect(brandObj).toBeDefined();
    expect(brandObj.code).toBeDefined();
    expect(brandObj.name).toBe(_brand.name);
    expect(brandObj.userId).toBe(_user._id);
  });

  test('Update brand', async () => {
    const _brandUpdateObj = await brandFactory({});

    // update brand object
    const brandObj = await Brands.updateBrand(_brand.id, {
      name: _brandUpdateObj.name,
      description: _brandUpdateObj.description,
      code: _brandUpdateObj.code
    });

    expect(brandObj.code).toBe(_brandUpdateObj.code);
    expect(brandObj.name).toBe(_brandUpdateObj.name);
    expect(brandObj.description).toBe(_brandUpdateObj.description);
  });

  test('Delete brand', async () => {
    await Brands.removeBrand(_brand.id);

    expect(await Brands.findOne({ _id: _brand.id }).countDocuments()).toBe(0);

    try {
      await Brands.removeBrand('test');
    } catch (e) {
      expect(e.message).toBe('Brand not found with id test');
    }
  });

  test('Update brand email config', async () => {
    const brandObj = await Brands.updateEmailConfig(
      _brand.id,
      _brand.emailConfig
    );

    if (!brandObj || !brandObj.emailConfig) {
      throw new Error('Brand not found');
    }

    expect(brandObj.emailConfig.type).toBe(_brand.emailConfig.type);
    expect(brandObj.emailConfig.template).toBe(_brand.emailConfig.template);
  });

  test('Manage integrations', async () => {
    const brand = await brandFactory({});

    const integration1 = await integrationFactory({});
    const integration2 = await integrationFactory({});

    await Brands.manageIntegrations({
      _id: brand._id,
      integrationIds: [integration1._id, integration2._id]
    });

    const integrationObj1 = await Integrations.findOne({
      _id: integration1._id
    });

    if (!integrationObj1) {
      throw new Error('Integration not found');
    }

    const integrationObj2 = await Integrations.findOne({
      _id: integration2._id
    });

    if (!integrationObj2) {
      throw new Error('Integration not found');
    }

    expect(integrationObj1.brandId).toBe(brand._id);
    expect(integrationObj2.brandId).toBe(brand._id);
  });
});
