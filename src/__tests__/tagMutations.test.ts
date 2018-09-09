import { connect, disconnect, graphqlRequest } from '../db/connection';
import { engageMessageFactory, tagsFactory, userFactory } from '../db/factories';
import { EngageMessages, Tags, Users } from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Test tags mutations', () => {
  let _tag;
  let _user;
  let _message;
  let doc;
  let context;

  const commonParamDefs = `
    $name: String!
    $type: String!
    $colorCode: String
  `;

  const commonParams = `
    name: $name
    type: $type
    colorCode: $colorCode
  `;

  beforeEach(async () => {
    // Creating test data
    _tag = await tagsFactory({});
    _user = await userFactory({});
    _message = await engageMessageFactory({});

    context = { user: _user };

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

  test('Add tag', async () => {
    const mutation = `
      mutation tagsAdd(${commonParamDefs}) {
        tagsAdd(${commonParams}) {
          name
          type
          colorCode
        }
      }
    `;

    const tag = await graphqlRequest(mutation, 'tagsAdd', doc, context);

    expect(tag.name).toBe(doc.name);
    expect(tag.type).toBe(doc.type);
    expect(tag.colorCode).toBe(doc.colorCode);
  });

  test('Edit tag', async () => {
    const mutation = `
      mutation tagsEdit($_id: String! ${commonParamDefs}){
        tagsEdit(_id: $_id ${commonParams}) {
          _id
          name
          type
          colorCode
        }
      }
    `;

    const tag = await graphqlRequest(mutation, 'tagsEdit', { _id: _tag._id, ...doc }, context);

    expect(tag._id).toBe(_tag._id);
    expect(tag.name).toBe(doc.name);
    expect(tag.type).toBe(doc.type);
    expect(tag.colorCode).toBe(doc.colorCode);
  });

  test('Remove tag', async () => {
    const mutation = `
      mutation tagsRemove($ids: [String!]!) {
        tagsRemove(ids: $ids)
      }
    `;

    await graphqlRequest(mutation, 'tagsRemove', { ids: [_tag._id] }, context);

    expect(await Tags.find({ _id: { $in: [_tag._id] } })).toEqual([]);
  });

  test('Tag tags', async () => {
    const args = {
      type: 'engageMessage',
      targetIds: [_message._id],
      tagIds: [_tag._id],
    };

    const mutation = `
      mutation tagsTag(
        $type: String!
        $targetIds: [String!]!
        $tagIds: [String!]!
      ) {
         tagsTag(
         type: $type
         targetIds: $targetIds
         tagIds: $tagIds
        )
      }
    `;

    await graphqlRequest(mutation, 'tagsTag', args, context);

    const engageMessage = await EngageMessages.findOne({ _id: _message._id });

    if (!engageMessage) {
      throw new Error('Engage message not found');
    }

    expect(engageMessage.tagIds).toContain(args.tagIds);
  });
});
