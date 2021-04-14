import { graphqlRequest } from '../db/connection';
import {
  conversationFactory,
  engageMessageFactory,
  tagsFactory,
  userFactory
} from '../db/factories';
import { Conversations, EngageMessages, Tags, Users } from '../db/models';
import { IConversationDocument } from '../db/models/definitions/conversations';

import './setup.ts';

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
      colorCode: _tag.colorCode
    };
  });

  afterEach(async () => {
    // Clearing test data
    await Tags.deleteMany({});
    await Users.deleteMany({});
    await EngageMessages.deleteMany({});
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

    const tag = await graphqlRequest(
      mutation,
      'tagsEdit',
      { _id: _tag._id, ...doc },
      context
    );

    expect(tag._id).toBe(_tag._id);
    expect(tag.name).toBe(doc.name);
    expect(tag.type).toBe(doc.type);
    expect(tag.colorCode).toBe(doc.colorCode);
  });

  test('Remove tag', async () => {
    const mutation = `
      mutation tagsRemove($_id: String!) {
        tagsRemove(_id: $_id)
      }
    `;

    const tagId = _tag._id;

    await graphqlRequest(mutation, 'tagsRemove', { _id: tagId }, context);

    expect(await Tags.findOne({ _id: tagId })).toBeNull();
  });

  test('Tag tags', async () => {
    let args = {
      type: 'engageMessage',
      targetIds: [_message._id],
      tagIds: [_tag._id]
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

    const engageMessage = await EngageMessages.getEngageMessage(_message._id);

    expect(engageMessage.tagIds).toContain(args.tagIds[0]);

    // conversation
    const conversation = await conversationFactory();

    const conversationTag = await tagsFactory({ type: 'conversation' });

    args = {
      type: 'conversation',
      targetIds: [conversation._id],
      tagIds: [conversationTag._id]
    };

    await graphqlRequest(mutation, 'tagsTag', args, context);

    expect(
      (await Conversations.getConversation(conversation._id)).tagIds
    ).toContain(args.tagIds[0]);
  });

  test('Tag merge', async () => {
    const t1 = await tagsFactory({ type: 'conversation' });
    const t2 = await tagsFactory({ type: 'conversation' });
    const t3 = await tagsFactory({ type: 'conversation' });

    let conv: IConversationDocument | null = await conversationFactory({});

    await Tags.tagObject({
      type: 'conversation',
      targetIds: [conv._id],
      tagIds: [t1._id, t3._id]
    });

    const mutation = `
      mutation tagsMerge(
        $sourceId: String!
        $destId: String!
      ) {
         tagsMerge(
         sourceId: $sourceId
         destId: $destId
        ) {
          _id
        }
      }
    `;

    await graphqlRequest(
      mutation,
      'tagsMerge',
      { sourceId: t1._id, destId: t2._id },
      context
    );

    conv = await Conversations.getConversation(conv._id);

    expect(conv.tagIds).toContain(t2._id);
  });
});
