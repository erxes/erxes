/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { userFactory, formFactory } from '../db/factories';
import { Forms, Users } from '../db/models';
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
