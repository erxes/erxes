/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Brands, Users } from '../db/models';
import { brandFactory, userFactory } from '../db/factories';
import brandMutations from '../data/resolvers/mutations/brands';

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

  test('Check login required mutations', async () => {
    const checkLogin = async (fn, args) => {
      try {
        await fn({}, args, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    expect.assertions(4);

    // brands add
    checkLogin(brandMutations.brandsAdd, { code: _brand.code, name: _brand.name });

    // brands edit
    checkLogin(brandMutations.brandsEdit, { _id: _brand.id });

    // brands remove
    checkLogin(brandMutations.brandsRemove, { _id: _brand.id });

    // brands update email config
    checkLogin(brandMutations.brandsConfigEmail, { _id: _brand.id });
  });

  test('Create brand', async () => {
    const _doc = {
      code: _brand.code,
      name: _brand.name,
      description: _brand.description,
    };

    Brands.createBrand = jest.fn();

    await brandMutations.brandsAdd({}, _doc, { user: _user });

    expect(Brands.createBrand.mock.calls.length).toBe(1);
    expect(Brands.createBrand).toBeCalledWith({ userId: _user._id, ..._doc });
  });

  test('Update brand', async () => {
    Brands.updateBrand = jest.fn();

    const _doc = {
      code: 'test',
      name: 'test',
      description: 'test',
    };

    // update brand object
    await brandMutations.brandsEdit({}, { _id: _brand._id, ..._doc }, { user: _user });

    expect(Brands.updateBrand.mock.calls.length).toBe(1);
    expect(Brands.updateBrand).toBeCalledWith(_brand._id, _doc);
  });

  test('Delete brand', async () => {
    Brands.removeBrand = jest.fn();

    await brandMutations.brandsRemove({}, { _id: _brand.id }, { user: _user });
    expect(Brands.removeBrand.mock.calls.length).toBe(1);
    expect(Brands.removeBrand).toBeCalledWith(_brand._id);
  });

  test('Update brand email config', async () => {
    Brands.updateEmailConfig = jest.fn();

    await brandMutations.brandsConfigEmail(
      {},
      { _id: _brand.id, emailConfig: _brand.emailConfig },
      { user: _user._id },
    );

    expect(Brands.updateEmailConfig.mock.calls.length).toBe(1);
    expect(Brands.updateEmailConfig).toBeCalledWith(_brand._id, _brand.emailConfig);
  });
});
