/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Segments, Users } from '../db/models';
import { userFactory, segmentFactory } from '../db/factories';
import segmentMutations from '../data/resolvers/mutations/segments';

beforeAll(() => connect());

afterAll(() => disconnect());

/*
 * Generate test data
 */
const generateData = () => ({
  name: 'New users',
  description: 'New users',
  subOf: 'DFSAFDSAFDFFFD',
  color: '#fdfdfd',
  connector: 'any',
  conditions: [
    {
      field: 'messengerData.sessionCount',
      operator: 'e',
      value: '10',
      dateUnit: 'days',
      type: 'string',
    },
  ],
});

/*
 * Check values
 */
const checkValues = (segmentObj, doc) => {
  expect(segmentObj.name).toBe(doc.name);
  expect(segmentObj.description).toBe(doc.description);
  expect(segmentObj.subOf).toBe(doc.subOf);
  expect(segmentObj.color).toBe(doc.color);
  expect(segmentObj.connector).toBe(doc.connector);

  expect(segmentObj.conditions.field).toEqual(doc.conditions.field);
  expect(segmentObj.conditions.operator).toEqual(doc.conditions.operator);
  expect(segmentObj.conditions.value).toEqual(doc.conditions.value);
  expect(segmentObj.conditions.dateUnit).toEqual(doc.conditions.dateUnit);
  expect(segmentObj.conditions.type).toEqual(doc.conditions.type);
};

describe('Segments mutations', () => {
  let _user;
  let _segment;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory();
    _segment = await segmentFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Segments.remove({});
    await Users.remove({});
  });

  test('Create segment', async () => {
    // Login required
    expect(() => segmentMutations.segmentsAdd({}, {}, {})).toThrowError('Login required');

    // valid
    const data = generateData();

    const segmentObj = await segmentMutations.segmentsAdd({}, data, { user: _user });

    checkValues(segmentObj, data);
  });

  test('Edit segment login required', async () => {
    expect.assertions(1);

    try {
      await segmentMutations.segmentsEdit({}, { _id: _segment.id }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Edit segment valid', async () => {
    const data = generateData();

    const segmentObj = await segmentMutations.segmentsEdit(
      {},
      { _id: _segment._id, ...data },
      { user: _user },
    );

    checkValues(segmentObj, data);
  });

  test('Remove segment login required', async () => {
    expect.assertions(1);

    try {
      await segmentMutations.segmentsRemove({}, { _id: _segment.id }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Remove segment valid', async () => {
    const segmentDeletedObj = await segmentMutations.segmentsRemove(
      {},
      { _id: _segment.id },
      { user: _user },
    );
    expect(segmentDeletedObj.id).toBe(_segment.id);

    const segmentObj = await Segments.findOne({ _id: _segment.id });
    expect(segmentObj).toBeNull();
  });
});
