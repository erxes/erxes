import {
  fetchSegment,
  generateQueryBySegment
} from '../data/modules/segments/queryBuilder';
import { customerFactory, dealFactory, segmentFactory } from '../db/factories';
import { Customers, Segments } from '../db/models';
import { trackCustomEvent } from '../events';
import { deleteAllIndexes, putMappings } from './esMappings';
import './setup.ts';

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const initialData = async () => {
  await customerFactory({}, false, true);

  await customerFactory(
    {
      firstName: 'bat',
      lastName: 'rombo'
    },
    false,
    true
  );

  await customerFactory(
    {
      firstName: 'batamar',
      lastName: 'dombo'
    },
    false,
    true
  );

  await sleep(2000);
};

describe('Segments mutations', () => {
  beforeEach(async () => {
    await putMappings();
  });

  afterEach(async () => {
    await Customers.remove({});
    await Segments.remove({});
    await deleteAllIndexes();
  });

  test('fetchBySegments: OR', async () => {
    await initialData();

    const subSegment = await segmentFactory({
      contentType: 'customer',
      conditionsConjunction: 'or',

      conditions: [
        {
          type: 'property',
          propertyName: 'lastName',
          propertyOperator: 'c',
          propertyValue: 'dombo'
        },
        {
          type: 'property',
          propertyName: 'lastName',
          propertyOperator: 'c',
          propertyValue: 'rombo'
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
          propertyValue: 'bat'
        }
      ]
    });

    const selector = { bool: {} };
    await generateQueryBySegment({
      segment: mainSegment,
      selector: selector.bool
    });

    expect(selector).toEqual({
      bool: {
        must: [
          {
            bool: {
              should: [
                {
                  bool: {
                    must: [
                      { wildcard: { lastName: '*dombo*' } },
                      { wildcard: { lastName: '*rombo*' } }
                    ]
                  }
                },
                { bool: { must_not: [{ term: { status: 'deleted' } }] } }
              ]
            }
          },
          { wildcard: { firstName: '*bat*' } }
        ],
        must_not: [{ term: { status: 'deleted' } }]
      }
    });

    const result = await fetchSegment(mainSegment);

    expect(result.length).toBe(2);
  });

  test('fetchBySegments: AND', async () => {
    await initialData();

    const subSegment = await segmentFactory({
      contentType: 'customer',
      conditionsConjunction: 'and',

      conditions: [
        {
          type: 'property',
          propertyName: 'lastName',
          propertyOperator: 'c',
          propertyValue: 'dombo'
        },
        {
          type: 'property',
          propertyName: 'lastName',
          propertyOperator: 'c',
          propertyValue: 'do'
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
          propertyValue: 'bat'
        }
      ]
    });

    const result = await fetchSegment(mainSegment);
    const customer = await Customers.findOne({ lastName: 'dombo' });

    expect(result.length).toBe(1);
    expect(result[0]).toBe(customer?._id);
  });

  test('fetchBySegments: event', async () => {
    await customerFactory({}, false, true);
    await customerFactory({}, false, true);

    const c1 = await customerFactory({ firstName: 'batamar' }, false, true);
    const c2 = await customerFactory({ firstName: 'bat' }, false, true);

    await trackCustomEvent({
      name: 'buttonClick',
      customerId: c1._id,
      attributes: {
        price: 1000
      }
    });

    await trackCustomEvent({
      name: 'buttonClick',
      customerId: c2._id,
      attributes: {
        price: 90
      }
    });

    await sleep(2000);

    const subSegment = await segmentFactory({
      contentType: 'customer',

      conditions: [
        {
          type: 'event',
          eventName: 'buttonClick',
          eventOccurence: 'atleast',
          eventOccurenceValue: 1,
          eventAttributeFilters: [
            {
              name: 'price',
              operator: 'numberigt',
              value: '100'
            }
          ]
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
          propertyValue: 'bat'
        }
      ]
    });

    const result = await fetchSegment(mainSegment);

    expect(result.length).toBe(1);
    expect(result[0]).toBe(c1._id);
  });

  test('fetchBySegments: card', async () => {
    await customerFactory({}, false, true);
    await customerFactory({}, false, true);
    await customerFactory({}, false, true);

    const c1 = await customerFactory({}, false, true);
    const c2 = await customerFactory({}, false, true);

    await dealFactory({}, true);
    await dealFactory({}, true);

    await dealFactory({ customerIds: [c1._id, c2._id], name: 'batdeal' }, true);

    await sleep(2000);

    const subSegment = await segmentFactory({
      contentType: 'deal',

      conditions: [
        {
          type: 'property',
          propertyName: 'name',
          propertyOperator: 'c',
          propertyValue: 'bat'
        }
      ]
    });

    const mainSegment = await segmentFactory({
      contentType: 'deal',

      conditions: [
        {
          type: 'subSegment',
          subSegmentId: subSegment._id
        },
        {
          type: 'property',
          propertyName: 'name',
          propertyOperator: 'e',
          propertyValue: 'batdeal'
        }
      ]
    });

    const result = await fetchSegment(mainSegment, {
      associatedCustomers: true
    });

    expect(result.length).toBe(2);

    const [id1, id2] = result;

    expect(id1).toBe(c1._id);
    expect(id2).toBe(c2._id);
  });
});
