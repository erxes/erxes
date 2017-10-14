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
const doc = {
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

  test('Check login required', async () => {
    expect.assertions(3);

    const check = async fn => {
      try {
        await fn({}, {}, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    // add
    check(segmentMutations.segmentsAdd);

    // edit
    check(segmentMutations.segmentsEdit);

    // add company
    check(segmentMutations.segmentsRemove);
  });

  test('Create segment', async () => {
    Segments.createSegment = jest.fn();

    await segmentMutations.segmentsAdd({}, doc, { user: _user });

    expect(Segments.createSegment).toBeCalledWith(doc);
  });

  test('Edit segment valid', async () => {
    Segments.updateSegment = jest.fn();

    await segmentMutations.segmentsEdit({}, { _id: _segment._id, ...doc }, { user: _user });

    expect(Segments.updateSegment).toBeCalledWith(_segment._id, doc);
  });

  test('Remove segment valid', async () => {
    Segments.removeSegment = jest.fn();

    await segmentMutations.segmentsRemove({}, { _id: _segment.id }, { user: _user });

    expect(Segments.removeSegment).toBeCalledWith(_segment.id);
  });
});
