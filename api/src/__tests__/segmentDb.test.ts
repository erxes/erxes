import { segmentFactory } from '../db/factories';
import { Segments, Users } from '../db/models';

import { ISegment } from '../db/models/definitions/segments';
import './setup.ts';

/*
 * Generate test data
 */
const generateData = (): ISegment => ({
  contentType: 'customer',
  name: 'New users',
  description: 'New users',
  subOf: 'DFSAFDSAFDFFFD',
  color: '#fdfdfd',
  conditions: [
    {
      type: 'property',
      propertyName: 'messengerData.sessionCount',
      propertyOperator: 'e',
      propertyValue: '10'
    }
  ]
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

  expect(segmentObj.conditions.field).toEqual(doc.conditions.field);
  expect(segmentObj.conditions.operator).toEqual(doc.conditions.operator);
  expect(segmentObj.conditions.value).toEqual(doc.conditions.value);
  expect(segmentObj.conditions.dateUnit).toEqual(doc.conditions.dateUnit);
  expect(segmentObj.conditions.type).toEqual(doc.conditions.type);
  expect(segmentObj.conditions.brandId).toEqual(doc.brandId);
};

describe('Segments mutations', () => {
  let _segment;

  beforeEach(async () => {
    // Creating test data

    const subSegment = await segmentFactory({});

    _segment = await segmentFactory({
      conditions: [
        {
          type: 'subSegment',
          subSegmentId: subSegment._id
        }
      ]
    });
  });

  afterEach(async () => {
    // Clearing test data
    await Segments.deleteMany({});
    await Users.deleteMany({});
  });

  test('Get segment', async () => {
    try {
      await Segments.getSegment('fakeId');
    } catch (e) {
      expect(e.message).toBe('Segment not found');
    }

    const response = await Segments.getSegment(_segment._id);

    expect(response).toBeDefined();
  });

  test('Create segment', async () => {
    // valid
    const data = generateData();

    const segmentObj = await Segments.createSegment(data, []);

    checkValues(segmentObj, data);
  });

  test('Update segment valid', async () => {
    const data = generateData();

    const segmentObj = await Segments.updateSegment(_segment._id, data, []);

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
