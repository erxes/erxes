/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Tags, Users, EngageMessages } from '../db/models';
import { tagsFactory, userFactory, engageMessageFactory } from '../db/factories';
import tagsMutations from '../data/resolvers/mutations/tags';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Tags mutations', () => {
  let _tag;
  let _user;
  let _message;
  let doc;

  beforeEach(async () => {
    // Creating test data
    _tag = await tagsFactory();
    _user = await userFactory();
    _message = await engageMessageFactory({});

    doc = {
      name: `${_tag.name}1`,
      type: _tag.type,
      colorCode: _tag.colorCode,
    };
  });

  afterEach(async () => {
    // Clearing test data
    await Tags.remove({});
    await Users.remove({});
    await EngageMessages.remove({});
  });

  test('Create tag', async () => {
    Tags.createTag = jest.fn();
    await tagsMutations.tagsAdd({}, doc, { user: _user });

    expect(Tags.createTag).toBeCalledWith(doc);
    expect(Tags.createTag.mock.calls.length).toBe(1);
  });

  test('Create tag login required', async () => {
    expect.assertions(1);
    try {
      await tagsMutations.tagsAdd({}, { type: _tag.type, name: _tag.name }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Update tag', async () => {
    Tags.updateTag = jest.fn();
    await tagsMutations.tagsUpdate(null, { _id: _tag._id, ...doc }, { user: _user });

    expect(Tags.updateTag).toBeCalledWith(_tag._id, doc);
    expect(Tags.updateTag.mock.calls.length).toBe(1);
  });

  test('Update tag login required', async () => {
    expect.assertions(1);
    try {
      await tagsMutations.tagsUpdate({}, { _id: _tag.id, name: _tag.name }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Remove tag', async () => {
    Tags.removeTag = jest.fn();
    await tagsMutations.tagsRemove({}, { ids: [_tag.id] }, { user: _user });

    expect(Tags.removeTag.mock.calls.length).toBe(1);
  });

  test('Remove tag login required', async () => {
    expect.assertions(1);
    try {
      await tagsMutations.tagsRemove({}, { ids: [_tag.id] }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Tags tag', async () => {
    const tagObj = {
      type: 'engageMessage',
      targetIds: [_message._id],
      tagIds: [_tag._id],
    };

    Tags.tagsTag = jest.fn();
    await tagsMutations.tagsTag({}, tagObj, { user: _user });

    expect(Tags.tagsTag.mock.calls.length).toBe(1);
  });
});
