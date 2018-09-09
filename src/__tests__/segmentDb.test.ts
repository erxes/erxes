import { connect, disconnect } from '../db/connection';
import { segmentFactory } from '../db/factories';
import { Segments, Users } from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

/*
 * Generate test data
 */
const generateData = () => ({
  contentType: 'customer',
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
  expect(segmentObj.contentType).toBe(doc.contentType);
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
  let _segment;

  beforeEach(async () => {
    // Creating test data
    _segment = await segmentFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Segments.remove({});
    await Users.remove({});
  });

  test('Create segment', async () => {
    // valid
    const data = generateData();

    const segmentObj = await Segments.createSegment(data);

    checkValues(segmentObj, data);
  });

  test('Update segment valid', async () => {
    const data = generateData();

    const segmentObj = await Segments.updateSegment(_segment._id, data);

    checkValues(segmentObj, data);
  });

  test('Remove segment valid', async () => {
    try {
      await Segments.removeSegment('DFFFDSFD');
    } catch (e) {
      expect(e.message).toBe('Segment not found with id DFFFDSFD');
    }

    await Segments.removeSegment(_segment.id);
    const segmentObj = await Segments.findOne({ _id: _segment.id });

    expect(segmentObj).toBeNull();
  });
});
