import { graphqlRequest } from '../db/connection';
import {
  customerFactory,
  dealFactory,
  internalNoteFactory,
  notificationConfigurationFactory,
  pipelineFactory,
  stageFactory,
  userFactory,
} from '../db/factories';
import { InternalNotes, Notifications, Users } from '../db/models';

import { NOTIFICATION_TYPES } from '../db/models/definitions/constants';
import './setup.ts';

describe('InternalNotes mutations', () => {
  let _user;
  let _internalNote;
  let context;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({});
    _internalNote = await internalNoteFactory({});

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await InternalNotes.deleteMany({});
    await Users.deleteMany({});
  });

  test('Add internal note', async () => {
    const customer = await customerFactory({});
    const user = await userFactory({});
    await notificationConfigurationFactory({ isAllowed: true, user, notifType: NOTIFICATION_TYPES.CUSTOMER_MENTION });

    if (!user || !user.details) {
      throw new Error('User not found');
    }

    let args = {
      contentType: 'customer',
      contentTypeId: customer._id,
      content: `@${user.details.fullName}`,
      mentionedUserIds: user._id,
    };

    const mutation = `
      mutation internalNotesAdd(
        $contentType: String!
        $contentTypeId: String
        $content: String
        $mentionedUserIds: [String]
      ) {
        internalNotesAdd(
          contentType: $contentType
          contentTypeId: $contentTypeId
          content: $content
          mentionedUserIds: $mentionedUserIds
        ) {
          contentType
          contentTypeId
          content
        }
      }
    `;

    let internalNote = await graphqlRequest(mutation, 'internalNotesAdd', args, context);

    let notification = await Notifications.findOne({ receiver: user._id });

    if (!notification) {
      throw new Error('Notification not found');
    }

    expect(notification).toBeDefined();

    expect(internalNote.contentType).toBe(args.contentType);
    expect(internalNote.contentTypeId).toBe(args.contentTypeId);
    expect(internalNote.content).toBe(args.content);

    // add internalNote on deal
    const mentionedUser = await userFactory({});
    const watchedUser = await userFactory({});
    const assignedUser = await userFactory({});
    const modifiedUser = await userFactory({});

    if (!mentionedUser || !mentionedUser.details) {
      throw new Error('User not found');
    }

    const pipeline = await pipelineFactory();
    const stage = await stageFactory({ pipelineId: pipeline._id });
    const deal = await dealFactory({
      watchedUserIds: [watchedUser._id],
      assignedUserIds: [assignedUser._id],
      modifiedBy: modifiedUser._id,
      stageId: stage._id,
    });

    await notificationConfigurationFactory({ isAllowed: true, user, notifType: NOTIFICATION_TYPES.DEAL_EDIT });

    args = {
      contentType: 'deal',
      contentTypeId: deal._id,
      content: `@${mentionedUser.details.fullName}`,
      mentionedUserIds: mentionedUser._id,
    };

    internalNote = await graphqlRequest(mutation, 'internalNotesAdd', args, context);

    notification = await Notifications.findOne({ receiver: assignedUser._id });
    expect(notification).toBeDefined();

    notification = await Notifications.findOne({ receiver: user._id });
    expect(notification).toBeDefined();

    notification = await Notifications.findOne({ receiver: assignedUser._id });
    expect(notification).toBeDefined();

    expect(internalNote.contentType).toBe(args.contentType);
    expect(internalNote.contentTypeId).toBe(args.contentTypeId);
    expect(internalNote.content).toBe(args.content);
  });

  test('Edit internal note', async () => {
    const { _id, content } = _internalNote;
    const args = { _id, content };

    const mutation = `
      mutation internalNotesEdit(
        $_id: String!
        $content: String
      ) {
        internalNotesEdit(
          _id: $_id
          content: $content
        ) {
          _id
          content
        }
      }
    `;

    const internalNote = await graphqlRequest(mutation, 'internalNotesEdit', args, context);

    expect(internalNote._id).toBe(args._id);
    expect(internalNote.content).toBe(args.content);
  });

  test('Remove internal note', async () => {
    const mutation = `
      mutation internalNotesRemove($_id: String!) {
        internalNotesRemove(_id: $_id) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'internalNotesRemove', { _id: _internalNote._id }, context);

    expect(await InternalNotes.findOne({ _id: _internalNote._id })).toBe(null);
  });
});
