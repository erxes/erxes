/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { userFactory, formFactory, fieldFactory, integrationFactory } from '../db/factories';
import { Forms, Users, Fields, Integrations } from '../db/models';
import toBeType from 'jest-tobetype';

expect.extend(toBeType);

beforeAll(() => connect());
afterAll(() => disconnect());

describe('form creation', () => {
  let _user;

  beforeEach(async () => {
    _user = await userFactory({});
  });

  afterEach(async () => {
    await Users.remove({});
    await Forms.remove({});
  });

  test(`testing if Error('createdUser must be supplied') is throwing as intended`, async () => {
    expect.assertions(1);

    try {
      await Forms.createForm({
        title: 'Test form',
        description: 'Test form description',
      });
    } catch (e) {
      expect(e.message).toEqual('createdUser must be supplied');
    }
  });

  test('check if form creation method is working successfully', async () => {
    let form = await Forms.createForm(
      {
        title: 'Test form',
        description: 'Test form description',
      },
      _user._id,
    );

    form = await Forms.findOne({ _id: form._id });

    expect(form.title).toBe('Test form');
    expect(form.description).toBe('Test form description');
    expect(form.code).toBeType('string');
    expect(form.code.length).toBe(6);
    // typeof form.createdDate is 'object' even though its Date
    expect(form.createdDate).toBeType('object');
    expect(form.createdUserId).toBe(_user._id);
  });
});

describe('form update', () => {
  let _user;
  let _form;

  beforeEach(async () => {
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user });
  });

  afterEach(async () => {
    await Users.remove({});
    await Forms.remove({});
  });

  test('check if form update method is working successfully', async () => {
    const doc = {
      title: 'Test form 2',
      description: 'Test form description 2',
    };

    const formAfterUpdate = await Forms.updateForm(_form._id, doc);

    expect(formAfterUpdate.title).toBe(doc.title);
    expect(formAfterUpdate.description).toBe(doc.description);
    expect(formAfterUpdate.createdUserId).toBe(_form.createdUserId);
    expect(formAfterUpdate.code).toBe(_form.code);
    expect(_form.createdDate).toBeType('object');
  });
});

describe('form remove', async () => {
  let _form;

  beforeEach(async () => {
    _form = await formFactory({});
  });

  afterEach(async () => {
    await Forms.remove({});
  });

  test('check if form removal is working successfully', async () => {
    await Forms.removeForm(_form._id);

    const formCount = await Forms.find({}).count();

    expect(formCount).toBe(0);
  });
});

describe('test exception in remove form method', async () => {
  let _user;
  let _form;

  beforeEach(async () => {
    _user = await userFactory({});

    _form = await formFactory({
      title: 'Test form',
      description: 'Test form description',
      createdUserId: _user._id,
    });
  });

  afterEach(async () => {
    await Users.remove({});
    await Forms.remove({});
    await Fields.remove({});
    await Integrations.remove({});
  });

  test('check if errors are being thrown as intended', async () => {
    expect.assertions(1);

    await integrationFactory({
      formId: _form._id,
      formData: {
        loadType: 'shoutbox',
        fromEmail: 'test@erxes.io',
      },
    });

    try {
      await Forms.removeForm(_form._id);
    } catch (e) {
      expect(e.message).toEqual('You cannot delete this form. This form used in integration.');
    }
  });
});

describe('form duplication', () => {
  let _user;
  let _form;

  beforeEach(async () => {
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user._id });
    await fieldFactory({ contentTypeId: _form._id });
    await fieldFactory({ contentTypeId: _form._id });
    await fieldFactory({ contentTypeId: _form._id });
  });

  afterEach(async () => {
    await Users.remove({});
    await Fields.remove({});
    await Forms.remove({});
  });

  test('test whether form duplication method is working successfully', async () => {
    const duplicatedForm = await Forms.duplicate(_form._id);

    expect(duplicatedForm.title).toBe(`${_form.title} duplicated`);
    expect(duplicatedForm.description).toBe(_form.description);
    expect(duplicatedForm.code).toBeType('string');
    expect(duplicatedForm.code.length).toEqual(6);
    expect(duplicatedForm.createdUserId).toBe(_form.createdUserId);

    const fieldsCount = await Fields.find({}).count();

    const duplicatedFieldsCount = await Fields.find({
      contentType: 'form',
      contentTypeId: duplicatedForm._id,
    }).count();

    expect(fieldsCount).toEqual(6);
    expect(duplicatedFieldsCount).toEqual(3);
  });
});
