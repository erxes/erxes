import { MODULE_NAMES } from '../data/constants';
import { graphqlRequest } from '../db/connection';
import {
  companyFactory,
  customerFactory,
  dealFactory,
  growthHackFactory,
  internalNoteFactory,
  notificationConfigurationFactory,
  productFactory,
  taskFactory,
  ticketFactory,
  userFactory,
} from '../db/factories';
import { InternalNotes, Notifications, Users } from '../db/models';
import { NOTIFICATION_TYPES } from '../db/models/definitions/constants';
import './setup.ts';

const checkContentType = (target, src) => {
  expect(src.contentType).toBe(target.contentType);
  expect(src.contentTypeId).toBe(target.contentTypeId);
};

describe('InternalNotes mutations', () => {
  let _user;
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
      contentType: MODULE_NAMES.DEAL,
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

    expect(internalNote.content).toBe(args.content);
    checkContentType(internalNote, args);

    // task
    const task = await taskFactory();

    args.contentType = MODULE_NAMES.TASK;
    args.contentTypeId = task._id;

    internalNote = await graphqlRequest(addMutation, 'internalNotesAdd', args, context);

    checkContentType(internalNote, args);

    // ticket
    const ticket = await ticketFactory();

    args.contentType = MODULE_NAMES.TICKET;
    args.contentTypeId = ticket._id;

    internalNote = await graphqlRequest(addMutation, 'internalNotesAdd', args, context);

    checkContentType(internalNote, args);

    // company
    const company = await companyFactory();

    args.contentType = MODULE_NAMES.COMPANY;
    args.contentTypeId = company._id;
    args.mentionedUserIds = undefined;

    internalNote = await graphqlRequest(addMutation, 'internalNotesAdd', args, context);

    checkContentType(internalNote, args);

    // growthHack
    const hack = await growthHackFactory();

    args.contentType = MODULE_NAMES.GROWTH_HACK;
    args.contentTypeId = hack._id;

    internalNote = await graphqlRequest(addMutation, 'internalNotesAdd', args, context);

    checkContentType(internalNote, args);

    // user
    const user = await userFactory();

    args.contentType = MODULE_NAMES.USER;
    args.contentTypeId = user._id;

    internalNote = await graphqlRequest(addMutation, 'internalNotesAdd', args, context);

    checkContentType(internalNote, args);

    // product
    const product = await productFactory();

    args.contentType = MODULE_NAMES.PRODUCT;
    args.contentTypeId = product._id;

    internalNote = await graphqlRequest(addMutation, 'internalNotesAdd', args, context);

    checkContentType(internalNote, args);
  });

  test('Add customer internal note', async () => {
    const customer = await customerFactory({});

    const args: any = {
      contentType: MODULE_NAMES.CUSTOMER,
      contentTypeId: customer._id,
      content: `@${_user.details.fullName}`,
    };

    const internalNote = await graphqlRequest(addMutation, 'internalNotesAdd', args, context);

    expect(internalNote.content).toBe(args.content);
    checkContentType(internalNote, args);

    const notification = await Notifications.findOne(args);

    expect(notification).toBeDefined();
  });

  test('Edit internal note', async () => {
    const customer = await customerFactory();
    const deal = await dealFactory();

    const note = await internalNoteFactory({ contentType: MODULE_NAMES.CUSTOMER, contentTypeId: customer._id });
    const dealNote = await internalNoteFactory({ contentType: MODULE_NAMES.DEAL, contentTypeId: deal._id });

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

    const internalNote = await graphqlRequest(
      mutation,
      'internalNotesEdit',
      { _id: note._id, content: note.content },
      context,
    );

    expect(internalNote._id).toBe(note._id);
    expect(internalNote.content).toBe(note.content);

    const dealInternalNote = await graphqlRequest(
      mutation,
      'internalNotesEdit',
      { _id: dealNote._id, content: dealNote.content },
      context,
    );

    expect(dealInternalNote._id).toBe(dealNote._id);
    expect(dealInternalNote.content).toBe(dealNote.content);
  });

  test('Remove internal note', async () => {
    // test different type of notes
    const company = await companyFactory();
    const deal = await dealFactory();
    const task = await taskFactory();
    const ticket = await ticketFactory();
    const hack = await growthHackFactory();
    const product = await productFactory();

    const note1 = await internalNoteFactory({ contentType: MODULE_NAMES.DEAL, contentTypeId: deal._id });
    const note2 = await internalNoteFactory({ contentType: MODULE_NAMES.COMPANY, contentTypeId: company._id });
    const note3 = await internalNoteFactory({ contentType: MODULE_NAMES.TASK, contentTypeId: task._id });
    const note4 = await internalNoteFactory({ contentType: MODULE_NAMES.TICKET, contentTypeId: ticket._id });
    const note5 = await internalNoteFactory({ contentType: MODULE_NAMES.GROWTH_HACK, contentTypeId: hack._id });
    const note6 = await internalNoteFactory({ contentType: MODULE_NAMES.USER, contentTypeId: _user._id });
    const note7 = await internalNoteFactory({ contentType: MODULE_NAMES.PRODUCT, contentTypeId: product._id });

    const mutation = `
      mutation internalNotesRemove($_id: String!) {
        internalNotesRemove(_id: $_id) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'internalNotesRemove', { _id: note1._id }, context);
    await graphqlRequest(mutation, 'internalNotesRemove', { _id: note2._id }, context);
    await graphqlRequest(mutation, 'internalNotesRemove', { _id: note3._id }, context);
    await graphqlRequest(mutation, 'internalNotesRemove', { _id: note4._id }, context);
    await graphqlRequest(mutation, 'internalNotesRemove', { _id: note5._id }, context);
    await graphqlRequest(mutation, 'internalNotesRemove', { _id: note6._id }, context);
    await graphqlRequest(mutation, 'internalNotesRemove', { _id: note7._id }, context);

    expect(await InternalNotes.findOne({ _id: note1._id })).toBe(null);
    expect(await InternalNotes.findOne({ _id: note2._id })).toBe(null);
    expect(await InternalNotes.findOne({ _id: note3._id })).toBe(null);
    expect(await InternalNotes.findOne({ _id: note4._id })).toBe(null);
    expect(await InternalNotes.findOne({ _id: note5._id })).toBe(null);
    expect(await InternalNotes.findOne({ _id: note6._id })).toBe(null);
    expect(await InternalNotes.findOne({ _id: note7._id })).toBe(null);
  });
});
