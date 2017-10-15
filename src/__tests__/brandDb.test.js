/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Brands, Users } from '../db/models';
import { brandFactory, userFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Brands mutations', () => {
  let _brand;
  let _user;

  beforeEach(async () => {
    // Creating test data
    _brand = await brandFactory();
    _user = await userFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Brands.remove({});
    await Users.remove({});
  });

  test('Create brand', async () => {
    const brandObj = await Brands.createBrand({
      code: _brand.code,
      name: _brand.name,
      description: _brand.description,
      userId: _user.id,
    });
    expect(brandObj).toBeDefined();
    expect(brandObj.code).toBe(_brand.code);
    expect(brandObj.name).toBe(_brand.name);
    expect(brandObj.userId).toBe(_user._id);

    // invalid data
    expect(() => {
      Brands.createBrand({ code: '', name: _brand.name, userId: _user.id });
    }).toThrowError('Code is required field');
  });

  test('Update brand', async () => {
    const _brandUpdateObj = await brandFactory();

    // update brand object
    const brandObj = await Brands.updateBrand(_brand.id, {
      code: _brandUpdateObj.code,
      name: _brandUpdateObj.name,
      description: _brandUpdateObj.description,
    });

    expect(brandObj.code).toBe(_brandUpdateObj.code);
    expect(brandObj.name).toBe(_brandUpdateObj.name);
    expect(brandObj.description).toBe(_brandUpdateObj.description);
  });

  test('Delete brand', async () => {
    await Brands.removeBrand(_brand.id);

    expect(await Brands.findOne({ _id: _brand.id }).count()).toBe(0);

    try {
      await Brands.removeBrand('test');
    } catch (e) {
      expect(e.message).toBe('Brand not found with id test');
    }
  });

  test('Update brand email config', async () => {
    const brandObj = await Brands.updateEmailConfig(_brand.id, _brand.emailConfig);

    expect(brandObj.emailConfig.type).toBe(_brand.emailConfig.type);
    expect(brandObj.emailConfig.template).toBe(_brand.emailConfig.template);
  });
});
