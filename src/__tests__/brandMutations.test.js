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

  test('Create brand', async () => {
    const brandObj = await brandMutations.brandsAdd(
      {},
      { code: _brand.code, name: _brand.name, description: _brand.description },
      { user: _user },
    );
    expect(brandObj).toBeDefined();
    expect(brandObj.code).toBe(_brand.code);
    expect(brandObj.name).toBe(_brand.name);
    expect(brandObj.userId).toBe(_user._id);

    // invalid data
    expect(() =>
      brandMutations.brandsAdd({}, { code: '', name: _brand.name }, { user: _user }),
    ).toThrowError('Code is required field');

    // Login required
    expect(() =>
      brandMutations.brandsAdd({}, { code: _brand.code, name: brandObj.name }, {}),
    ).toThrowError('Login required');
  });

  test('Update brand', async () => {
    // get new brand object
    const _brand_update = await brandFactory();

    // update brand object
    const brandObj = await brandMutations.brandsEdit(
      {},
      {
        _id: _brand.id,
        code: _brand_update.code,
        name: _brand_update.name,
        description: _brand_update.description,
      },
      { user: _user },
    );

    // check changes
    expect(brandObj.code).toBe(_brand_update.code);
    expect(brandObj.name).toBe(_brand_update.name);
    expect(brandObj.description).toBe(_brand_update.description);
  });

  test('Update brand login required', async () => {
    expect.assertions(1);
    try {
      await brandMutations.brandsEdit({}, { _id: _brand.id }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Delete brand', async () => {
    const brandDeletedObj = await brandMutations.brandsRemove(
      {},
      { _id: _brand.id },
      { user: _user },
    );
    expect(brandDeletedObj.id).toBe(_brand.id);

    const brandObj = await Brands.findOne({ _id: _brand.id });
    expect(brandObj).toBeNull();
  });

  test('Delete brand login required', async () => {
    expect.assertions(1);
    try {
      await brandMutations.brandsRemove({}, { _id: _brand.id }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Update brand email config', async () => {
    const brandObj = await brandMutations.brandsConfigEmail(
      {},
      { _id: _brand.id, emailConfig: _brand.emailConfig },
      { user: _brand.userId },
    );

    expect(brandObj).toBeDefined();
    expect(brandObj.emailConfig.type).toBe(_brand.emailConfig.type);
    expect(brandObj.emailConfig.template).toBe(_brand.emailConfig.template);
  });
});
