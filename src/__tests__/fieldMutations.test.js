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
const generateData = () => ({
  type: 'input',
  validation: 'number',
  text: faker.random.word(),
  description: faker.random.word(),
  isRequired: false,
  order: 0,
});

/*
 * Check values
 */
const checkValues = (fieldObj, doc) => {
  expect(fieldObj.type).toBe(doc.type);
  expect(fieldObj.validation).toBe(doc.validation);
  expect(fieldObj.text).toBe(doc.text);
  expect(fieldObj.description).toBe(doc.description);
  expect(fieldObj.isRequired).toBe(doc.isRequired);
  expect(fieldObj.order).toBe(doc.order);
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

  test('Create field', async () => {
    // Login required
    expect(() => fieldMutations.fieldsAdd({}, {}, {})).toThrowError('Login required');

    // valid
    const doc = generateData();

    const fieldObj = await fieldMutations.fieldsAdd({}, doc, { user: _user });

    checkValues(fieldObj, doc);
  });

  test('Edit field login required', async () => {
    expect.assertions(1);

    try {
      await fieldMutations.fieldsEdit({}, { _id: _field.id }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Edit field valid', async () => {
    const doc = generateData();

    const fieldObj = await fieldMutations.fieldsEdit(
      {},
      { _id: _field._id, ...doc },
      { user: _user },
    );

    checkValues(fieldObj, doc);
  });

  test('Remove field login required', async () => {
    expect.assertions(1);

    try {
      await fieldMutations.fieldsRemove({}, { _id: _field.id }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Remove field valid', async () => {
    const fieldDeletedObj = await fieldMutations.fieldsRemove(
      {},
      { _id: _field.id },
      { user: _user },
    );

    expect(fieldDeletedObj.id).toBe(_field.id);

    const fieldObj = await Fields.findOne({ _id: _field.id });
    expect(fieldObj).toBeNull();
  });
});
