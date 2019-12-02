import { graphqlRequest } from '../db/connection';
import {
  companyFactory,
  customerFactory,
  dealFactory,
  internalNoteFactory,
  notificationConfigurationFactory,
  taskFactory,
  ticketFactory,
  userFactory,
} from '../db/factories';
import { InternalNotes, Notifications, Users } from '../db/models';

import { NOTIFICATION_TYPES } from '../db/models/definitions/constants';
import './setup.ts';

describe('InternalNotes mutations', () => {
  let _user;
  let _internalNote;
  let context;

  const addMutation = `
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
    await notificationConfigurationFactory({
      isAllowed: true,
      user: _user,
      notifType: NOTIFICATION_TYPES.CUSTOMER_MENTION,
    });

    // add internalNote on deal
    const mentionedUser = await userFactory({});
    const watchedUser = await userFactory({});
    const assignedUser = await userFactory({});
    const modifiedUser = await userFactory({});

    if (!mentionedUser || !mentionedUser.details) {
      throw new Error('User not found');
    }

    const deal = await dealFactory({
      watchedUserIds: [watchedUser._id],
      assignedUserIds: [assignedUser._id],
      modifiedBy: modifiedUser._id,
    });

    let notification = await Notifications.findOne({ receiver: _user._id });

    await notificationConfigurationFactory({ isAllowed: true, user: _user, notifType: NOTIFICATION_TYPES.DEAL_EDIT });

    const args: any = {
      contentType: 'deal',
      contentTypeId: deal._id,
      content: `@${mentionedUser.details.fullName}`,
      mentionedUserIds: mentionedUser._id,
    };

    let internalNote = await graphqlRequest(addMutation, 'internalNotesAdd', args, context);

    notification = await Notifications.findOne({ receiver: assignedUser._id });
    expect(notification).toBeDefined();

    notification = await Notifications.findOne({ receiver: _user._id });
    expect(notification).toBeDefined();

    notification = await Notifications.findOne({ receiver: assignedUser._id });
    expect(notification).toBeDefined();

    expect(internalNote.contentType).toBe(args.contentType);
    expect(internalNote.contentTypeId).toBe(args.contentTypeId);
    expect(internalNote.content).toBe(args.content);

    // task
    const task = await taskFactory();

    args.contentType = 'task';
    args.contentTypeId = task._id;

    internalNote = await graphqlRequest(addMutation, 'internalNotesAdd', args, context);

    expect(internalNote.contentType).toBe('task');
    expect(internalNote.contentTypeId).toBe(task._id);

    // ticket
    const ticket = await ticketFactory();

    args.contentType = 'ticket';
    args.contentTypeId = ticket._id;

    internalNote = await graphqlRequest(addMutation, 'internalNotesAdd', args, context);

    expect(internalNote.contentType).toBe('ticket');
    expect(internalNote.contentTypeId).toBe(ticket._id);

    // company
    const company = await companyFactory();

    args.contentType = 'company';
    args.contentTypeId = company._id;
    args.mentionedUserIds = undefined;

    internalNote = await graphqlRequest(addMutation, 'internalNotesAdd', args, context);

    expect(internalNote.contentType).toBe('company');
    expect(internalNote.contentTypeId).toBe(company._id);
  });

  test('Add customer internal note', async () => {
    const customer = await customerFactory({});

    const args: any = {
      contentType: 'customer',
      contentTypeId: customer._id,
      content: `@${_user.details.fullName}`,
    };

    const internalNote = await graphqlRequest(addMutation, 'internalNotesAdd', args, context);

    expect(internalNote.contentType).toBe(args.contentType);
    expect(internalNote.contentTypeId).toBe(args.contentTypeId);
    expect(internalNote.content).toBe(args.content);

    const notification = await Notifications.findOne(args);

    expect(notification).toBeDefined();
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
