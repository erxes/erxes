import { fetchBySegments } from '../data/modules/segments/queryBuilder';
import { customerFactory, segmentFactory } from '../db/factories';
import { deleteAllIndexes, putMappings } from './esMappings';
import './setup.ts';

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

describe('Segments mutations', () => {
  beforeEach(async () => {
    await putMappings();
  });

  afterEach(async () => {
    await deleteAllIndexes();
  });

  test('fetchBySegments', async () => {
    await customerFactory({}, false, true);

    await customerFactory(
      {
        firstName: 'batamar',
        lastName: 'gombo'
      },
      false,
      true
    );

    await sleep(2000);

    const subSegment = await segmentFactory({
      contentType: 'customer',

      conditions: [
        {
          type: 'property',
          propertyName: 'firstName',
          propertyOperator: 'c',
          propertyValue: 'bat'
        },
        {
          type: 'property',
          propertyName: 'lastName',
          propertyOperator: 'dnc',
          propertyValue: 'dombo'
        }
      ]
    });

    const mainSegment = await segmentFactory({
      contentType: 'customer',

      conditions: [
        {
          type: 'subSegment',
          subSegmentId: subSegment._id
        },
        {
          type: 'property',
          propertyName: 'firstName',
          propertyOperator: 'c',
          propertyValue: 'batamar'
        }
      ]
    });

    const result = await fetchBySegments(mainSegment);

    expect(result.length).toBe(1);
  });
});
