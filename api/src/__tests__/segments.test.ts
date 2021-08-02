import {
  fetchSegment,
  generateQueryBySegment,
  isInSegment
} from '../data/modules/segments/queryBuilder';
import { customerFactory, dealFactory, segmentFactory } from '../db/factories';
import { Customers, Segments } from '../db/models';
import { trackCustomEvent } from '../events';
import { deleteAllIndexes, putMappings } from './esMappings';
import { sleep } from './setup';

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

  test('fetchBySegment: OR', async () => {
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

  test('fetchBySegment: AND', async () => {
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

  test('fetchBySegment: event', async () => {
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

  const prepareCardData = async (extraAction?) => {
    await customerFactory({}, false, true);
    await customerFactory({}, false, true);
    await customerFactory({}, false, true);

    const c1 = await customerFactory({}, false, true);
    const c2 = await customerFactory({}, false, true);

    await dealFactory({}, true);
    await dealFactory({}, true);

    const d1 = await dealFactory(
      { customerIds: [c1._id, c2._id], name: 'batdeal' },
      true
    );

    if (extraAction) {
      await extraAction({ c1, c2 });
    }

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

    return { mainSegment, d1, c1, c2 };
  };

  test('fetchBySegment: card', async () => {
    const { mainSegment, c1, c2 } = await prepareCardData();

    let result = await fetchSegment(mainSegment, {
      associatedCustomers: true
    });

    expect(result.length).toBe(2);

    const [id1, id2] = result;

    expect(id1).toBe(c1._id);
    expect(id2).toBe(c2._id);

    // count =============
    result = await fetchSegment(mainSegment, {
      returnCount: true
    });

    expect(result).toBe(1);
  });

  test('fetchBySegment: check exists', async () => {
    let d3;

    const { mainSegment, d1 } = await prepareCardData(async ({ c1, c2 }) => {
      await dealFactory(
        { customerIds: [c1._id, c2._id], name: 'batdeal' },
        true
      );
      d3 = await dealFactory(
        { customerIds: [c1._id, c2._id], name: 'seconddeal' },
        true
      );
    });

    const d1result = await isInSegment(mainSegment._id, d1._id, {});
    expect(d1result).toBe(true);

    const d3result = await isInSegment(mainSegment._id, d3._id, {});
    expect(d3result).toBe(false);
  });
});
