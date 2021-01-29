import { engageMessageFactory, tagsFactory } from '../db/factories';
import { EngageMessages, Tags } from '../db/models';

import './setup.ts';

describe('Test tags model', () => {
  let _tag;
  let _tag2;
  let _message;

  beforeEach(async () => {
    // Creating test data
    _tag = await tagsFactory({});
    _tag2 = await tagsFactory({});
    _message = await engageMessageFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Tags.deleteMany({});
    await EngageMessages.deleteMany({});
  });

  test('Get tag', async () => {
    try {
      await Tags.getTag('fakeId');
    } catch (e) {
      expect(e.message).toBe('Tag not found');
    }

    const response = await Tags.getTag(_tag._id);

    expect(response).toBeDefined();
  });

  test('Validate unique tag', async () => {
    const empty = await Tags.validateUniqueness({}, '', '');

    const selectTag = await Tags.validateUniqueness(
      { type: _tag2.type },
      'new tag',
      _tag2.type
    );

    const existing = await Tags.validateUniqueness({}, _tag.name, _tag.type);

    expect(empty).toEqual(true);
    expect(selectTag).toEqual(false);
    expect(existing).toEqual(false);
  });

  test('Tag not found', async () => {
    expect.assertions(1);
    try {
      await Tags.tagObject({
        tagIds: [_tag._id],
        objectIds: [],
        collection: EngageMessages,
        tagType: 'customer'
      });
    } catch (e) {
      expect(e.message).toEqual('Tag not found.');
    }
  });

  test('Attach customer tag', async () => {
    Tags.tagsTag('customer', [], []);
  });

  test('Attach integration tag', async () => {
    Tags.tagsTag('integration', [], []);
  });

  test('Attach product tag', async () => {
    Tags.tagsTag('product', [], []);
  });

  test('Create tag check duplicated', async () => {
    expect.assertions(1);
    try {
      await Tags.createTag(_tag2);
    } catch (e) {
      expect(e.message).toEqual('Tag duplicated');
    }
  });

  test('Update tag check duplicated', async () => {
    expect.assertions(2);
    try {
      await Tags.updateTag(_tag2._id, {
        name: _tag.name,
        type: _tag.type
      });
    } catch (e) {
      expect(e.message).toEqual('Tag duplicated');
    }

    try {
      const childTag = await tagsFactory({ parentId: _tag2._id });

      await Tags.updateTag(_tag2._id, {
        name: 'child tag',
        type: _tag.type,
        parentId: childTag._id
      });
    } catch (e) {
      expect(e.message).toEqual('Cannot change tag');
    }
  });

  test('Create tag', async () => {
    const tagObj = await Tags.createTag({
      name: `${_tag.name}1`,
      type: _tag.type,
      colorCode: _tag.colorCode
    });

    expect(tagObj).toBeDefined();
    expect(tagObj.name).toEqual(`${_tag.name}1`);
    expect(tagObj.type).toEqual(_tag.type);
    expect(tagObj.colorCode).toEqual(_tag.colorCode);
    expect(tagObj.order).toEqual(`${_tag.name}1${_tag.type}`);
  });

  test('Update tag', async () => {
    const tagObj = await Tags.updateTag(_tag._id, {
      name: _tag.name,
      type: _tag.type,
      colorCode: _tag.colorCode
    });

    expect(tagObj).toBeDefined();
    expect(tagObj.name).toEqual(_tag.name);
    expect(tagObj.type).toEqual(_tag.type);
    expect(tagObj.colorCode).toEqual(_tag.colorCode);

    const tag2 = await Tags.createTag({
      name: 'sub tag',
      type: _tag.type,
      parentId: tagObj._id
    });

    let parentTag = await Tags.findOne({ _id: tagObj._id }).lean();

    expect(tag2.order).toEqual(`${tagObj.order}/sub tag${_tag.type}`);
    expect(parentTag.relatedIds).toEqual([tag2._id]);

    const tag3 = await Tags.createTag({
      name: 'sub tag 2',
      type: _tag.type,
      parentId: tag2._id
    });

    expect(tag3.order).toEqual(`${tag2.order}/sub tag 2${_tag.type}`);

    const updatedTag2 = await Tags.findOne({ _id: tag2._id }).lean();
    expect(updatedTag2.relatedIds).toEqual([tag3._id]);

    parentTag = await Tags.findOne({ _id: tagObj._id }).lean();
    expect(parentTag.relatedIds).toEqual([tag3._id, tag2._id]);

    const newTag = await tagsFactory({});

    await Tags.updateTag(tag2._id, {
      name: 'change parent tag',
      type: _tag.type,
      parentId: newTag._id
    });

    parentTag = await Tags.findOne({ _id: tagObj._id }).lean();
    expect(parentTag.relatedIds.length).toEqual(0);
  });

  test('Remove tag', async () => {
    const parentId = _tag._id;

    const newTag = await Tags.createTag({
      name: 'new',
      type: _tag.type,
      parentId
    });

    let parentTag = await Tags.findOne({ _id: parentId }).lean();

    expect(parentTag.relatedIds.length).toEqual(1);
    expect(parentTag.relatedIds).toEqual([newTag._id]);

    const isDeleted = await Tags.removeTag(newTag.id);
    parentTag = await Tags.findOne({ _id: parentId }).lean();

    expect(isDeleted).toBeTruthy();
    expect(parentTag.relatedIds.length).toEqual(0);

    const empty = await Tags.removeTag(parentId);
    expect(empty).toBeTruthy();
  });

  test('Tags tag', async () => {
    const type = 'engageMessage';
    const targetIds = [_message._id];
    const tagIds = [_tag._id];

    await Tags.tagsTag(type, targetIds, tagIds);

    const messageObj = await EngageMessages.findOne({ _id: _message._id });
    const tagObj = await Tags.findOne({ _id: _tag._id });

    if (!messageObj || !messageObj.tagIds) {
      throw new Error('Campaign not found');
    }

    if (!tagObj) {
      throw new Error('Tag not found');
    }

    expect(tagObj.objectCount).toBe(1);
    expect(messageObj.tagIds[0]).toEqual(_tag.id);
  });

  test('Attach company tag', async () => {
    Tags.tagsTag('company', [], []);
  });

  test('Remove tag not found', async () => {
    expect.assertions(1);
    try {
      await Tags.removeTag(_message._id);
    } catch (e) {
      expect(e.message).toEqual('Tag not found');
    }
  });

  test("Can't remove a tag", async () => {
    expect.assertions(2);
    try {
      await EngageMessages.updateMany(
        { _id: _message._id },
        { $set: { tagIds: [_tag._id] } }
      );

      await Tags.removeTag(_tag._id);
    } catch (e) {
      expect(e.message).toEqual("Can't remove a tag with tagged object(s)");
    }

    try {
      await Tags.createTag({
        name: 'child tag',
        type: _tag.type,
        parentId: _tag._id
      });

      await Tags.removeTag(_tag._id);
    } catch (e) {
      expect(e.message).toEqual("Can't remove a tag");
    }
  });
});
