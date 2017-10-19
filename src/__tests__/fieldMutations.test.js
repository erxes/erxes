/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import faker from 'faker';
import { connect, disconnect } from '../db/connection';
import { Fields, Users } from '../db/models';
import { userFactory, fieldFactory } from '../db/factories';
import fieldMutations from '../data/resolvers/mutations/fields';

beforeAll(() => connect());

afterAll(() => disconnect());

/*
 * Generate test data
 */
const doc = {
  type: 'input',
  validation: 'number',
  text: faker.random.word(),
  description: faker.random.word(),
  isRequired: false,
  order: 0,
};

describe('Fields mutations', () => {
  let _user;
  let _field;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory();
    _field = await fieldFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Fields.remove({});
    await Users.remove({});
  });

  test('Check login required', async () => {
    expect.assertions(4);

    const check = async fn => {
      try {
        await fn({}, {}, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    // add
    check(fieldMutations.fieldsAdd);

    // edit
    check(fieldMutations.fieldsEdit);

    // add company
    check(fieldMutations.fieldsRemove);

    // update order
    check(fieldMutations.fieldsUpdateOrder);
  });

  test('Create field', async () => {
    Fields.createField = jest.fn();

    await fieldMutations.fieldsAdd({}, doc, { user: _user });

    expect(Fields.createField).toBeCalledWith(doc);
  });

  test('Update field valid', async () => {
    Fields.updateField = jest.fn();

    await fieldMutations.fieldsEdit({}, { _id: _field._id, ...doc }, { user: _user });

    expect(Fields.updateField).toBeCalledWith(_field._id, doc);
  });

  test('Remove field valid', async () => {
    Fields.removeField = jest.fn();

    await fieldMutations.fieldsRemove({}, { _id: _field.id }, { user: _user });

    expect(Fields.removeField).toBeCalledWith(_field._id);
  });

  test('Update order', async () => {
    Fields.updateOrder = jest.fn();

    const orders = [{ _id: 'DFADF', order: 1 }];

    await fieldMutations.fieldsUpdateOrder({}, { _id: _field._id, orders }, { user: _user });

    expect(Fields.updateOrder).toBeCalledWith(orders);
  });
});
