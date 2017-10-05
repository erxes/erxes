/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Tags, Users } from '../db/models';
import { tagsFactory, userFactory } from '../db/factories';
import tagsMutations from '../data/resolvers/mutations/tags';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Tags mutations', () => {
  let _tag;
  let _user;

  beforeEach(async () => {
    // Creating test data
    _tag = await tagsFactory();
    _user = await userFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Tags.remove({});
    await Users.remove({});
  });

  test('Create tag', async () => {
    const tagObj = await tagsMutations.tagsAdd(
      {},
      { name: `${_tag.name}1`, type: `${_tag.type}1`, colorCode: _tag.colorCode },
      { user: _user },
    );

    expect(tagObj).toBeDefined();
  });

  test('Update tag', async () => {
    const tagObj = await tagsMutations.tagsEdit(
      {},
      { _id: _tag.id, name: _tag.name, type: _tag.type, colorCode: _tag.colorCode },
      { user: _user },
    );

    expect(tagObj).toBeDefined();
  });

  test('Delete tag', async () => {
    const isDeleted = await tagsMutations.tagsRemove({}, { ids: [_tag.id] }, { user: _user });
    expect(isDeleted).toBeTruthy();
  });
});
