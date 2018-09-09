import * as toBeType from 'jest-tobetype';
import { connect, disconnect } from '../db/connection';
import { customerFactory, fieldFactory, formFactory, userFactory } from '../db/factories';
import { Customers, Fields, Forms, Users } from '../db/models';

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
      await Forms.createForm(
        {
          title: 'Test form',
          description: 'Test form description',
        },
        undefined,
      );
    } catch (e) {
      expect(e.message).toEqual('createdUser must be supplied');
    }
  });

  test('check if form creation method is working successfully', async () => {
    const form = await Forms.createForm(
      {
        title: 'Test form',
        description: 'Test form description',
      },
      _user._id,
    );

    const formObj = await Forms.findOne({ _id: form._id });

    if (!formObj || !formObj.code) {
      throw new Error('Form not found');
    }

    expect(formObj.title).toBe('Test form');
    expect(formObj.description).toBe('Test form description');
    expect(formObj.code.length).toBe(6);
    expect(formObj.createdDate).toBeDefined();
    expect(formObj.createdUserId).toBe(_user._id);
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
    expect(_form.createdDate).toBeDefined();
  });
});

describe('form remove', async () => {
  let _form;

  beforeEach(async () => {
    _form = await formFactory({});
  });

  afterEach(async () => {
    await Forms.remove({});
    await Fields.remove({});
    await Customers.remove({});
  });

  test('check if form removal is working successfully', async () => {
    const customer = await customerFactory({});

    await fieldFactory({
      contentType: 'customer',
      contentTypeId: customer._id,
    });
    await fieldFactory({ contentType: 'form', contentTypeId: _form._id });
    await fieldFactory({ contentType: 'form', contentTypeId: _form._id });
    await fieldFactory({ contentType: 'form', contentTypeId: _form._id });

    await Forms.removeForm(_form._id);

    const formCount = await Forms.find({}).count();
    const fieldsCount = await Fields.find({}).count();

    expect(formCount).toBe(0);
    expect(fieldsCount).toBe(1);
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

    if (!duplicatedForm || !duplicatedForm.code) {
      throw new Error('Form not found');
    }

    expect(duplicatedForm.title).toBe(`${_form.title} duplicated`);
    expect(duplicatedForm.description).toBe(_form.description);
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
