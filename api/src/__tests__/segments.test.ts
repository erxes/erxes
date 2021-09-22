import {
  fetchSegment,
  generateQueryBySegment,
  isInSegment
} from '../data/modules/segments/queryBuilder';
import {
  boardFactory,
  customerFactory,
  dealFactory,
  fieldFactory,
  formFactory,
  formSubmissionFactory,
  pipelineFactory,
  segmentFactory,
  stageFactory
} from '../db/factories';
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

const initialData2 = async () => {
  await customerFactory({ firstName: 'c1' }, false, true);
  await customerFactory({ firstName: 'c2' }, false, true);
  await customerFactory({ firstName: 'bat' }, false, true);
  await customerFactory({ firstName: 'dorj' }, false, true);
  await customerFactory({ firstName: 'jombo', lastName: 'bat' }, false, true);

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
          propertyType: 'customer',
          propertyName: 'lastName',
          propertyOperator: 'c',
          propertyValue: 'dombo'
        },
        {
          type: 'property',
          propertyType: 'customer',
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
          propertyType: 'customer',
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

    const result = await fetchSegment(mainSegment);

    expect(result.length).toBe(2);
  });

  test('fetchBySegment: OR second', async () => {
    await initialData2();

    const sub1 = await segmentFactory({
      contentType: 'customer',
      conditionsConjunction: 'or',

      conditions: [
        {
          type: 'property',
          propertyType: 'customer',
          propertyName: 'firstName',
          propertyOperator: 'c',
          propertyValue: 'bat'
        },
        {
          type: 'property',
          propertyType: 'customer',
          propertyName: 'firstName',
          propertyOperator: 'c',
          propertyValue: 'dorj'
        }
      ]
    });

    const sub2 = await segmentFactory({
      contentType: 'customer',

      conditions: [
        {
          type: 'property',
          propertyType: 'customer',
          propertyName: 'lastName',
          propertyOperator: 'c',
          propertyValue: 'bat'
        }
      ]
    });

    const mainSegment = await segmentFactory({
      contentType: 'customer',
      conditionsConjunction: 'or',

      conditions: [
        {
          type: 'subSegment',
          subSegmentId: sub1._id
        },
        {
          type: 'subSegment',
          subSegmentId: sub2._id
        }
      ]
    });

    const selector = { bool: {} };

    await generateQueryBySegment({
      segment: mainSegment,
      selector: selector.bool
    });

    const result = await fetchSegment(mainSegment);

    expect(result.length).toBe(3);
  });

  test('fetchBySegment: AND', async () => {
    await initialData();

    const subSegment = await segmentFactory({
      contentType: 'customer',
      conditionsConjunction: 'and',

      conditions: [
        {
          type: 'property',
          propertyType: 'customer',
          propertyName: 'lastName',
          propertyOperator: 'c',
          propertyValue: 'dombo'
        },
        {
          type: 'property',
          propertyType: 'customer',
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
          propertyType: 'customer',
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

  test('fetchBySegment: AND complex', async () => {
    await initialData2();

    const sub1 = await segmentFactory({
      contentType: 'customer',

      conditions: [
        {
          type: 'property',
          propertyType: 'customer',
          propertyName: 'firstName',
          propertyOperator: 'c',
          propertyValue: 'bat'
        },
        {
          type: 'property',
          propertyType: 'customer',
          propertyName: 'firstName',
          propertyOperator: 'dnc',
          propertyValue: 'dorj'
        }
      ]
    });

    const sub2 = await segmentFactory({
      contentType: 'customer',

      conditions: [
        {
          type: 'property',
          propertyType: 'customer',
          propertyName: 'lastName',
          propertyOperator: 'c',
          propertyValue: 'bat'
        }
      ]
    });

    const mainSegment = await segmentFactory({
      contentType: 'customer',
      conditionsConjunction: 'or',

      conditions: [
        {
          type: 'subSegment',
          subSegmentId: sub1._id
        },
        {
          type: 'subSegment',
          subSegmentId: sub2._id
        },
        {
          type: 'property',
          propertyType: 'customer',
          propertyName: 'firstName',
          propertyOperator: 'e',
          propertyValue: 'c1'
        }
      ]
    });

    const selector = { bool: {} };

    await generateQueryBySegment({
      segment: mainSegment,
      selector: selector.bool
    });

    const result = await fetchSegment(mainSegment);

    expect(result.length).toBe(3);
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
          propertyType: 'customer',
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
          propertyType: 'deal',
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
          propertyType: 'deal',
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

  test('fetchBySegment: mixed content types', async () => {
    await customerFactory({}, false, true);
    await customerFactory({}, false, true);
    await customerFactory({}, false, true);

    const customer = await customerFactory(
      {
        firstName: 'batamar',
        lastName: 'dombo'
      },
      false,
      true
    );

    const customer2 = await customerFactory(
      { firstName: 'batamar' },
      false,
      true
    );

    await dealFactory({}, true);
    await dealFactory(
      { customerIds: [customer2._id], name: 'dombodeal' },
      true
    );
    await dealFactory({ customerIds: [customer._id], name: 'batdeal' }, true);

    await sleep(2000);

    const subSegment = await segmentFactory({
      contentType: 'customer',
      conditionsConjunction: 'or',

      conditions: [
        {
          type: 'property',
          propertyType: 'deal',
          propertyName: 'name',
          propertyOperator: 'c',
          propertyValue: 'dombo'
        },
        {
          type: 'property',
          propertyType: 'deal',
          propertyName: 'name',
          propertyOperator: 'c',
          propertyValue: 'bat'
        }
      ]
    });

    const segment = await segmentFactory({
      contentType: 'customer',
      conditionsConjunction: 'and',

      conditions: [
        {
          type: 'subSegment',
          subSegmentId: subSegment._id
        },
        {
          type: 'property',
          propertyType: 'customer',
          propertyName: 'lastName',
          propertyOperator: 'c',
          propertyValue: 'dombo'
        }
      ]
    });

    const result = await fetchSegment(segment);

    expect(result.length).toBe(1);
    expect(result[0]).toBe(customer._id);
  });

  test('fetchBySegment: form submissions', async () => {
    await customerFactory({}, false, true);
    await customerFactory({}, false, true);

    const customer = await customerFactory({}, false, true);

    const form = await formFactory({});
    const field = await fieldFactory({
      contentType: 'form',
      contentTypeId: form._id
    });

    await formSubmissionFactory(
      {
        formId: form._id,
        customerId: customer._id,
        formFieldId: field._id,
        value: 'test'
      },
      true
    );

    await sleep(2000);

    const segment = await segmentFactory({
      contentType: 'customer',
      conditionsConjunction: 'and',

      conditions: [
        {
          type: 'property',
          propertyType: 'form_submission',
          propertyName: 'formFieldId',
          propertyOperator: 'e',
          propertyValue: field._id
        },
        {
          type: 'property',
          propertyType: 'form_submission',
          propertyName: 'value',
          propertyOperator: 'c',
          propertyValue: 'test'
        }
      ]
    });

    const result = await fetchSegment(segment);

    expect(result.length).toBe(1);
    expect(result[0]).toBe(customer._id);
  });

  test('fetchBySegment: boardId & pipelineId', async () => {
    await customerFactory({}, false, true);
    await customerFactory({}, false, true);

    const customer = await customerFactory({}, false, true);
    const customer2 = await customerFactory({}, false, true);
    
    const pipeline = await pipelineFactory({});
    const stage = await stageFactory({ pipelineId: pipeline._id });
    const board1 = await boardFactory({});
    const board2 = await boardFactory({});
    const b1p1 = await pipelineFactory({ boardId: board1._id });
    const b2p1 = await pipelineFactory({ boardId: board2._id });
    const p1s1 = await stageFactory({ pipelineId: b1p1._id });
    const p2s1 = await stageFactory({ pipelineId: b2p1._id });

    await dealFactory({}, true);
    await dealFactory({}, true);
    const deal = await dealFactory({ stageId: p1s1._id, name: 'p1test', customerIds: [customer._id] }, true);
    const deal2 = await dealFactory({ name: 'p1test', customerIds: [customer2._id], stageId: stage._id }, true);
    await dealFactory({ stageId: p1s1._id }, true);
    await dealFactory({ stageId: p2s1._id, name: 'p2test', customerIds: [customer._id] }, true);
    await dealFactory({ stageId: p2s1._id }, true);

    await sleep(2000);

    // different content type
    let segment = await segmentFactory({
      contentType: 'customer',
      conditionsConjunction: 'and',

      conditions: [
        {
          boardId: board1._id,
          pipelineId: b1p1._id,
          type: 'property',
          propertyType: 'deal',
          propertyName: 'name',
          propertyOperator: 'c',
          propertyValue: 'test'
        }
      ]
    });

    let result = await fetchSegment(segment);

    expect(result.length).toBe(1);
    expect(result[0]).toBe(customer._id);

    // same content type
    segment = await segmentFactory({
      contentType: 'deal',
      conditionsConjunction: 'and',

      conditions: [
        {
          boardId: board1._id,
          pipelineId: b1p1._id,
          type: 'property',
          propertyType: 'deal',
          propertyName: 'name',
          propertyOperator: 'c',
          propertyValue: 'test'
        }
      ]
    });

    result = await fetchSegment(segment);

    expect(result.length).toBe(1);
    expect(result[0]).toBe(deal._id);

    // pipelineId in options
    result = await fetchSegment(segment, { pipelineId: pipeline._id });

    expect(result.length).toBe(1);
    expect(result[0]).toBe(deal2._id);
  });
});
