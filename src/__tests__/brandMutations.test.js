/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { Brands } from '../db/models';
import { ROLES } from '../data/constants';
import brandMutations from '../data/resolvers/mutations/brands';

describe('Brands mutations', () => {
  const _brand = {
    _id: 'fakeBrandId',
    code: 'fakeBrandCode',
    name: 'fakeBrandName',
  };
  const _user = { _id: 'fakeId', role: ROLES.CONTRIBUTOR };
  const _adminUser = { _id: 'fakeId', role: ROLES.ADMIN };

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
    checkLogin(brandMutations.brandsEdit, { _id: _brand._id });

    // brands remove
    checkLogin(brandMutations.brandsRemove, { _id: _brand._id });

    // brands update email config
    checkLogin(brandMutations.brandsConfigEmail, { _id: _brand._id });
  });

  test(`test if Error('Permission required') error is working as intended`, async () => {
    const checkLogin = async (fn, args) => {
      try {
        await fn({}, args, { user: _user });
      } catch (e) {
        expect(e.message).toEqual('Permission required');
      }
    };

    expect.assertions(4);

    // brands add
    checkLogin(brandMutations.brandsAdd, { code: _brand.code, name: _brand.name });

    // brands edit
    checkLogin(brandMutations.brandsEdit, { _id: _brand._id });

    // brands remove
    checkLogin(brandMutations.brandsRemove, { _id: _brand._id });

    // brands update email config
    checkLogin(brandMutations.brandsConfigEmail, { _id: _brand._id });
  });

  test('Create brand', async () => {
    const _doc = {
      code: _brand.code,
      name: _brand.name,
      description: _brand.description,
    };

    Brands.createBrand = jest.fn();

    await brandMutations.brandsAdd({}, _doc, { user: _adminUser });

    expect(Brands.createBrand.mock.calls.length).toBe(1);
    expect(Brands.createBrand).toBeCalledWith({ userId: _adminUser._id, ..._doc });
  });

  test('Update brand', async () => {
    Brands.updateBrand = jest.fn();

    const _doc = {
      code: 'test',
      name: 'test',
      description: 'test',
    };

    // update brand object
    await brandMutations.brandsEdit({}, { _id: _brand._id, ..._doc }, { user: _adminUser });

    expect(Brands.updateBrand.mock.calls.length).toBe(1);
    expect(Brands.updateBrand).toBeCalledWith(_brand._id, _doc);
  });

  test('Delete brand', async () => {
    Brands.removeBrand = jest.fn();

    await brandMutations.brandsRemove({}, { _id: _brand._id }, { user: _adminUser });
    expect(Brands.removeBrand.mock.calls.length).toBe(1);
    expect(Brands.removeBrand).toBeCalledWith(_brand._id);
  });

  test('Update brand email config', async () => {
    Brands.updateEmailConfig = jest.fn();

    await brandMutations.brandsConfigEmail(
      {},
      { _id: _brand._id, emailConfig: _brand.emailConfig },
      { user: _adminUser },
    );

    expect(Brands.updateEmailConfig.mock.calls.length).toBe(1);
    expect(Brands.updateEmailConfig).toBeCalledWith(_brand._id, _brand.emailConfig);
  });

  test('Manage integrations', async () => {
    Brands.manageIntegrations = jest.fn();

    const args = { _id: _brand._id, integrationIds: ['_id1', '_id2'] };

    await brandMutations.brandsManageIntegrations({}, args, { user: _adminUser });

    expect(Brands.manageIntegrations.mock.calls.length).toBe(1);
    expect(Brands.manageIntegrations).toBeCalledWith(args);
  });
});
