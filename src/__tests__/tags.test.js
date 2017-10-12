/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Tags, Users, EngageMessages } from '../db/models';
import { tagsFactory, userFactory, segmentsFactory } from '../db/factories';
import tagsMutations from '../data/resolvers/mutations/tags';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Tags mutations', () => {
  let _tag;
  let _user;
  let _segment;

  beforeEach(async () => {
    // Creating test data
    _tag = await tagsFactory();
    _user = await userFactory();
    _segment = await segmentsFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Tags.remove({});
    await Users.remove({});
    await EngageMessages.remove({});
  });

  test('Create tag', async () => {
    const tagObj = await tagsMutations.tagsAdd(
      {},
      { name: `${_tag.name}1`, type: _tag.type, colorCode: _tag.colorCode },
      { user: _user },
    );

    expect(tagObj).toBeDefined();
    expect(tagObj.name).toEqual(`${_tag.name}1`);
    expect(tagObj.type).toEqual(_tag.type);
    expect(tagObj.colorCode).toEqual(_tag.colorCode);
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
    const tagObj = await tagsMutations.tagsEdit(
      {},
      { _id: _tag.id, name: _tag.name, type: _tag.type, colorCode: _tag.colorCode },
      { user: _user },
    );

    expect(tagObj).toBeDefined();
    expect(tagObj.name).toEqual(_tag.name);
    expect(tagObj.type).toEqual(_tag.type);
    expect(tagObj.colorCode).toEqual(_tag.colorCode);
  });

  test('Update tag login required', async () => {
    expect.assertions(1);
    try {
      await tagsMutations.tagsEdit({}, { _id: _tag.id, name: _tag.name }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Delete tag', async () => {
    const isDeleted = await tagsMutations.tagsRemove({}, { ids: [_tag.id] }, { user: _user });
    expect(isDeleted).toBeTruthy();
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
    const doc = {
      kind: 'manual',
      title: 'Message test',
      fromUserId: _user._id,
      segmentId: _segment._id,
      isLive: true,
      isDraft: false,
    };

    const message = await EngageMessages.createMessage(doc);
    await tagsMutations.tagsTag(
      {},
      { type: 'engageMessage', targetIds: [message._id], tagIds: [_tag._id] },
      { user: _user },
    );

    const messageObj = await EngageMessages.findOne({ _id: message._id });
    const tagObj = await Tags.findOne({ _id: _tag._id });

    expect(tagObj.objectCount).toBe(1);
    expect(messageObj.tagIds[0]).toEqual(_tag.id);
  });
});
