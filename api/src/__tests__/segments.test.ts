import {
  elkConvertConditionToQuery,
  fetchSegment,
  generateNestedQuery,
  generateQueryBySegment,
  getIndexByContentType,
  isInSegment
} from '../data/modules/segments/queryBuilder';
import {
  boardFactory,
  companyFactory,
  customerFactory,
  dealFactory,
  fieldFactory,
  formFactory,
  formSubmissionFactory,
  pipelineFactory,
  segmentFactory,
  stageFactory,
  taskFactory,
  ticketFactory
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

  test('fetchBySegment: AND 2 subs', async () => {
    await customerFactory({}, false, true);
    await customerFactory({}, false, true);
    await customerFactory({ state: 'visitor' }, false, true);
    await customerFactory({ state: 'customer' }, false, true);

    await sleep(2000);

    const subSegment1 = await segmentFactory({
      contentType: 'customer',

      conditions: [
        {
          type: 'property',
          propertyType: 'customer',
          propertyName: 'state',
          propertyOperator: 'e',
          propertyValue: 'visitor'
        }
      ]
    });

    const subSegment2 = await segmentFactory({
      contentType: 'customer',

      conditions: [
        {
          type: 'property',
          propertyType: 'customer',
          propertyName: 'state',
          propertyOperator: 'e',
          propertyValue: 'customer'
        }
      ]
    });

    const mainSegment = await segmentFactory({
      contentType: 'customer',

      conditions: [
        {
          type: 'subSegment',
          subSegmentId: subSegment1._id
        },
        {
          type: 'subSegment',
          subSegmentId: subSegment2._id
        },
      ]
    });

    const result = await fetchSegment(mainSegment);

    expect(result.length).toBe(0);
  });

  test('fetchBySegment: AND 2 subs - version 2', async () => {
    await customerFactory({}, false, true);
    await customerFactory({}, false, true);
    await customerFactory({ state: 'visitor' }, false, true);
    await customerFactory({ state: 'customer' }, false, true);

    await sleep(2000);

    const subSegment1 = await segmentFactory({
      contentType: 'customer',

      conditions: [
        {
          type: 'property',
          propertyType: 'customer',
          propertyName: 'state',
          propertyOperator: 'e',
          propertyValue: 'visitor'
        },
        {
          type: 'property',
          propertyType: 'customer',
          propertyName: 'state',
          propertyOperator: 'e',
          propertyValue: 'customer'
        }
      ]
    });

    const subSegment2 = await segmentFactory({
      contentType: 'customer',

      conditions: [
        {
          type: 'property',
          propertyType: 'customer',
          propertyName: 'state',
          propertyOperator: 'is',
        }
      ]
    });

    const mainSegment = await segmentFactory({
      contentType: 'customer',

      conditions: [
        {
          type: 'subSegment',
          subSegmentId: subSegment1._id
        },
        {
          type: 'subSegment',
          subSegmentId: subSegment2._id
        },
      ]
    });

    const result = await fetchSegment(mainSegment);

    expect(result.length).toBe(0);
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
              operator: 'numberdne',
              value: '100'
            }
          ]
        },
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

  test('fetchBySegment: eventOccurence', async () => {
    await customerFactory({}, false, true);
    await customerFactory({}, false, true);

    const c1 = await customerFactory({ firstName: 'batamar' }, false, true);

    await trackCustomEvent({
      name: 'buttonClick',
      customerId: c1._id,
      attributes: {
        price: 10
      }
    });

    await sleep(2000);

    // exactly
    const condition: any = {
      type: "event",
      eventName: "buttonClick",
      eventOccurence: "exactly",
      eventOccurenceValue: 1,
      eventAttributeFilters: [
        {
          name: "price",
          operator: "numbere",
          value: "10",
        },
      ],
    };

    let segment = await segmentFactory({
      contentType: 'customer',
      conditions: [condition]
    });

    let result = await fetchSegment(segment);
    expect(result[0]).toBe(c1._id);

    // atmost
    condition.eventOccurence = 'atmost';
    condition.eventAttributeFilters[0].operator = 'numberilt';
    condition.eventAttributeFilters[0].value = '11';

    segment = await segmentFactory({
      contentType: 'customer',
      conditions: [condition]
    });

    result = await fetchSegment(segment);
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
          propertyName: field._id,
          propertyOperator: 'e',
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
    const deal = await dealFactory(
      { stageId: p1s1._id, name: 'p1test', customerIds: [customer._id] },
      true
    );
    const deal2 = await dealFactory(
      { name: 'p1test', customerIds: [customer2._id], stageId: stage._id },
      true
    );
    await dealFactory({ stageId: p1s1._id }, true);
    await dealFactory(
      { stageId: p2s1._id, name: 'p2test', customerIds: [customer._id] },
      true
    );
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
    segment = await segmentFactory({
      contentType: 'deal',
      conditionsConjunction: 'and',
      boardId: board1._id,
      pipelineId: b1p1._id,

      conditions: [
        {
          type: 'property',
          propertyType: 'deal',
          propertyName: 'name',
          propertyOperator: 'c',
          propertyValue: 'test'
        }
      ]
    });

    result = await fetchSegment(segment, { pipelineId: pipeline._id });

    expect(result.length).toBe(1);
    expect(result[0]).toBe(deal2._id);
  });

  test('fetchBySegment: parent segment', async () => {
    await customerFactory({}, false, true);
    await customerFactory({}, false, true);
    await customerFactory({ lastName: 'dombo' }, false, true);
    await customerFactory({ lastName: 'gombo' }, false, true);
    const customer = await customerFactory(
      { lastName: 'dombo gombo' },
      false,
      true
    );

    await sleep(2000);

    const parent = await segmentFactory({
      contentType: 'customer',
      conditionsConjunction: 'and',

      conditions: [
        {
          type: 'property',
          propertyType: 'customer',
          propertyName: 'lastName',
          propertyOperator: 'c',
          propertyValue: 'gombo'
        }
      ]
    });

    const sub = await segmentFactory({
      contentType: 'customer',
      conditionsConjunction: 'and',
      subOf: parent._id,

      conditions: [
        {
          type: 'property',
          propertyType: 'customer',
          propertyName: 'lastName',
          propertyOperator: 'c',
          propertyValue: 'dombo'
        }
      ]
    });

    const result = await fetchSegment(sub);

    expect(result.length).toBe(1);
    expect(result[0]).toBe(customer._id);
  });

  test('fetchBySegment: return selector', async () => {
    await customerFactory({ lastName: 'la' }, false, true);
    await customerFactory({ lastName: 'te'} , false, true);

    await sleep(2000);

    const segment = await segmentFactory({
      contentType: 'customer',

      conditions: [
        {
          type: 'property',
          propertyType: 'customer',
          propertyName: 'lastName',
          propertyOperator: 'is',
        }
      ]
    });

    let result = await fetchSegment(segment, { returnSelector: true });
    expect(result).toBeDefined();

    result = await fetchSegment(segment, { returnFullDoc: true });
    expect(result).toBeDefined();

    result = await fetchSegment(segment, { returnFields: ['_id'] });
    expect(result).toBeDefined();
  });

  test('fetchBySegment: associationPropertyFilter', async () => {
    const company = await companyFactory({ primaryName: 'name' }, true);
    const deal = await dealFactory({ companyIds: [company._id ]}, true);
    const ticket = await ticketFactory({ companyIds: [company._id ]}, true);
    const task = await taskFactory({ companyIds: [company._id ]}, true);

    await sleep(2000);

    let segment = await segmentFactory({
      contentType: 'company',

      conditions: [
        {
          type: 'property',
          propertyType: 'deal',
          propertyName: 'name',
          propertyOperator: 'is',
        }
      ]
    });

    const conditions: any = [
      {
        type: "property",
        propertyType: "company",
        propertyName: "primaryName",
        propertyOperator: "is",
      },
    ];

    // assiated deal on company
    let result = await fetchSegment(segment, {});
    const [companyId] = result;
    expect(companyId).toBe(company._id);

    // assiated company on deal
    segment = await segmentFactory({
      contentType: 'deal',
      conditions
    });

    result = await fetchSegment(segment, {});
    const [dealId] = result;
    expect(dealId).toBe(deal._id);

    // assiated company on task
    segment = await segmentFactory({
      contentType: 'task',
      conditions
    });

    result = await fetchSegment(segment, {});
    const [taskId] = result;
    expect(taskId).toBe(task._id);

    // assiated company on ticket
    segment = await segmentFactory({
      contentType: 'ticket',
      conditions
    });

    result = await fetchSegment(segment, {});
    const [ticketId] = result;
    expect(ticketId).toBe(ticket._id);

    // get content type
    expect(getIndexByContentType('conversation')).toBe('conversations');
  });

  test('fetchBySegment: elkConvertConditionToQuery', async () => {
    const condition = {
      field: 'firstName',
      type: 'number',
      operator: 'dne',
      value: '10'
    };

    let [positiveQuery, negativeQuery] = elkConvertConditionToQuery(condition);

    expect(JSON.stringify(negativeQuery)).toBe(JSON.stringify({ match_phrase: { firstName: '10' } }));

    // contains =================
    condition.operator = 'c';
    [positiveQuery, negativeQuery] = elkConvertConditionToQuery(condition);
    expect(JSON.stringify(positiveQuery)).toBe(JSON.stringify({ wildcard: { firstName: '*10*' } }));

    // does not contains =================
    condition.operator = 'dnc';
    [positiveQuery, negativeQuery] = elkConvertConditionToQuery(condition);
    expect(JSON.stringify(negativeQuery)).toBe(JSON.stringify({ wildcard: { firstName: '*10*' } }));

    // greater than equal =================
    condition.operator = 'igt';
    [positiveQuery, negativeQuery] = elkConvertConditionToQuery(condition);
    expect(JSON.stringify(positiveQuery)).toBe(JSON.stringify({ range: { firstName: { gte: '10' } } }));

    // is true =================
    condition.operator = 'it';
    [positiveQuery, negativeQuery] = elkConvertConditionToQuery(condition);
    expect(JSON.stringify(positiveQuery)).toBe(JSON.stringify({ term: { firstName: true } }));

    // is false =================
    condition.operator = 'if';
    [positiveQuery, negativeQuery] = elkConvertConditionToQuery(condition);
    expect(JSON.stringify(positiveQuery)).toBe(JSON.stringify({ term: { firstName: false} }));

    // is set =================
    condition.operator = 'is';
    [positiveQuery, negativeQuery] = elkConvertConditionToQuery(condition);
    expect(JSON.stringify(positiveQuery)).toBe(JSON.stringify({ exists: { field: 'firstName' } }));

    // is not set =================
    condition.operator = 'ins';
    [positiveQuery, negativeQuery] = elkConvertConditionToQuery(condition);
    expect(JSON.stringify(negativeQuery)).toBe(JSON.stringify({ exists: { field: 'firstName' } }));

    //  will occur after on following n-th minute =================
    condition.field = 'createdAt';
    condition.operator = 'woam';
    [positiveQuery, negativeQuery] = elkConvertConditionToQuery(condition);
    expect(JSON.stringify(positiveQuery)).toBe(JSON.stringify({ range: { createdAt: { gte: `now-10m/m`, lte: `now-10m/m` } } }));

    // will occur before on following n-th minute =================
    condition.operator = 'wobm';
    [positiveQuery, negativeQuery] = elkConvertConditionToQuery(condition);
    expect(JSON.stringify(positiveQuery)).toBe(JSON.stringify({ range: { createdAt: { gte: `now+10m/m`, lte: `now+10m/m` } } }));

    //  will occur after on following n-th day =================
    condition.operator = 'woad';
    [positiveQuery, negativeQuery] = elkConvertConditionToQuery(condition);
    expect(JSON.stringify(positiveQuery)).toBe(JSON.stringify({ range: { createdAt: { gte: `now-10d/d`, lte: `now-10d/d` } } }));

    //  will occur before on following n-th day =================
    condition.operator = 'wobd';
    [positiveQuery, negativeQuery] = elkConvertConditionToQuery(condition);
    expect(JSON.stringify(positiveQuery)).toBe(JSON.stringify({ range: { createdAt: { gte: `now+10d/d`, lte: `now+10d/d` } } }));

    // date relative less than =================
    condition.operator = 'drlt';
    [positiveQuery, negativeQuery] = elkConvertConditionToQuery(condition);
    expect(JSON.stringify(positiveQuery)).toBe(JSON.stringify({ range: { createdAt: { lte: '10' } } }));

    // date relative greater than =================
    condition.operator = 'drgt';
    [positiveQuery, negativeQuery] = elkConvertConditionToQuery(condition);
    expect(JSON.stringify(positiveQuery)).toBe(JSON.stringify({ range: { createdAt: { gte: '10' } } }));
  });

  test('fetchBySegment: generateNestedQuery', async () => {
    generateNestedQuery('events', 'createdAt', 'dateigt', {});
  });
});
