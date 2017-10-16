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
  let _tag2;
  let _user;
  let _message;
  let doc;

  beforeEach(async () => {
    // Creating test data
    _tag = await tagsFactory();
    _tag2 = await tagsFactory();
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

  test('Check login required', async () => {
    expect.assertions(4);

    const check = async fn => {
      try {
        await fn({}, {}, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    // add
    check(tagsMutations.tagsAdd);

    // edit
    check(tagsMutations.tagsEdit);

    // remove
    check(tagsMutations.tagsRemove);

    // tags tag
    check(tagsMutations.tagsTag);
  });

  test('Check tag duplicated', async () => {
    expect.assertions(2);
    const check = async (mutation, doc) => {
      try {
        await mutation({}, doc, { user: _user });
      } catch (e) {
        expect(e.message).toEqual('Tag duplicated');
      }
    };

    // add
    await check(tagsMutations.tagsAdd, _tag2);

    // edit
    await check(tagsMutations.tagsEdit, { _id: _tag2._id, name: _tag.name, type: _tag.type });
  });

  test('Create tag', async () => {
    Tags.createTag = jest.fn();
    await tagsMutations.tagsAdd({}, doc, { user: _user });

    expect(Tags.createTag).toBeCalledWith(doc);
    expect(Tags.createTag.mock.calls.length).toBe(1);
  });

  test('Update tag', async () => {
    Tags.updateTag = jest.fn();
    await tagsMutations.tagsEdit(null, { _id: _tag._id, ...doc }, { user: _user });

    expect(Tags.updateTag).toBeCalledWith(_tag._id, doc);
    expect(Tags.updateTag.mock.calls.length).toBe(1);
  });

  test('Remove tag not found', async () => {
    expect.assertions(1);
    try {
      await tagsMutations.tagsRemove({}, { ids: [_message._id] }, { user: _user });
    } catch (e) {
      expect(e.message).toEqual('Tag not found');
    }
  });

  test("Can't remove a tag", async () => {
    expect.assertions(1);
    try {
      await EngageMessages.update({ _id: _message._id }, { $set: { tagIds: [_tag._id] } });
      await tagsMutations.tagsRemove({}, { ids: [_tag._id] }, { user: _user });
    } catch (e) {
      expect(e.message).toEqual("Can't remove a tag with tagged object(s)");
    }
  });

  test('Remove tag', async () => {
    Tags.removeTag = jest.fn();
    await tagsMutations.tagsRemove({}, { ids: [_tag.id] }, { user: _user });

    expect(Tags.removeTag.mock.calls.length).toBe(1);
  });

  test('Tags tag', async () => {
    Tags.tagsTag = jest.fn();
    const tagObj = {
      type: 'engageMessage',
      targetIds: [_message._id],
      tagIds: [_tag._id],
    };

    await tagsMutations.tagsTag({}, tagObj, { user: _user });

    expect(Tags.tagsTag.mock.calls.length).toBe(1);
  });
});
