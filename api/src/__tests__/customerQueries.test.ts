import * as moment from 'moment';
import * as sinon from 'sinon';
import { graphqlRequest } from '../db/connection';
import {
  brandFactory,
  companyFactory,
  conformityFactory,
  conversationFactory,
  customerFactory,
  formFactory,
  formSubmissionFactory,
  integrationFactory,
  segmentFactory,
  tagsFactory
} from '../db/factories';
import {
  Conformities,
  Conversations,
  Customers,
  FormSubmissions,
  Segments,
  Tags
} from '../db/models';
import * as elk from '../elasticsearch';
import { deleteAllIndexes, putMappings } from './esMappings';
import { sleep } from './setup';

import './setup.ts';

describe('customerQueries', () => {
  const commonParamDefs = `
    $page: Int,
    $perPage: Int,
    $segment: String,
    $tag: String,
    $ids: [String],
    $searchValue: String,
    $form: String,
    $startDate: String,
    $endDate: String,
    $leadStatus: String
  `;

  const commonParams = `
    page: $page
    perPage: $perPage
    segment: $segment
    tag: $tag
    ids: $ids
    searchValue: $searchValue
    form: $form
    startDate: $startDate
    endDate: $endDate
    leadStatus: $leadStatus
  `;

  const qryCustomers = `
    query customers(${commonParamDefs}) {
      customers(${commonParams}) {
        _id
      }
    }
  `;

  const qryCustomersMain = `
    query customersMain(${commonParamDefs}) {
      customersMain(${commonParams}) {
        list {
          _id
          firstName
          lastName
          primaryEmail
          primaryPhone
          tagIds
        }
        totalCount
      }
    }
  `;

  const qryCount = `
    query customerCounts(${commonParamDefs} $only: String) {
      customerCounts(${commonParams} only: $only)
    }
  `;

  let gmock;

  const createGMock = () => {
    gmock = sinon.stub(elk, 'fetchElk').callsFake(() => {
      return Promise.resolve({ hits: { hits: [] } });
    });
  };

  beforeEach(async () => {
    await putMappings();
  });

  afterEach(async () => {
    // Clearing test data
    await Customers.deleteMany({});
    await Segments.deleteMany({});
    await Tags.deleteMany({});
    await FormSubmissions.deleteMany({});
    await Conformities.deleteMany({});
    await Conversations.deleteMany({});
    await deleteAllIndexes();
  });

  test('Customers', async () => {
    await createGMock();

    await graphqlRequest(qryCustomers, 'customers', {});

    gmock.restore();
  });

  test('Customers filtered by ids', async () => {
    await createGMock();

    const customer1 = await customerFactory({}, true);
    const customer2 = await customerFactory({}, true);
    const customer3 = await customerFactory({}, true);

    await customerFactory({}, true);
    await customerFactory({}, true);
    await customerFactory({}, true);

    const ids = [customer1._id, customer2._id, customer3._id];

    await graphqlRequest(qryCustomers, 'customers', { ids });

    gmock.restore();
  });

  test('Main customers', async () => {
    await createGMock();
    await graphqlRequest(qryCustomersMain, 'customersMain', {});
    gmock.restore();
  });

  test('Count customers', async () => {
    const customer1 = await customerFactory({}, true);
    const customer2 = await customerFactory({}, true);
    const customer3 = await customerFactory({}, true);

    // Creating test data
    await segmentFactory({ contentType: 'customer' });

    const args = {
      only: 'bySegment',
      ids: [customer1._id, customer2._id, customer3._id]
    };

    await graphqlRequest(qryCount, 'customerCounts', args);
  });

  test('Customers count by segment', async () => {
    // Creating test data
    await segmentFactory({ contentType: 'customer' });

    const args = { only: 'bySegment' };

    await graphqlRequest(qryCount, 'customerCounts', args);
  });

  test('Count customers by brand', async () => {
    await brandFactory({});

    await graphqlRequest(qryCount, 'customerCounts', {
      only: 'byBrand'
    });
  });

  test('Customer count by tag', async () => {
    await tagsFactory({ type: 'company' });
    await tagsFactory({ type: 'customer' });

    await graphqlRequest(qryCount, 'customerCounts', {
      only: 'byTag'
    });
  });

  test('Customer count by form', async () => {
    await formFactory({});

    await graphqlRequest(qryCount, 'customerCounts', {
      only: 'byForm'
    });
  });

  test('Customer count by leadStatus', async () => {
    await graphqlRequest(qryCount, 'customerCounts', {
      only: 'byLeadStatus'
    });
  });

  test('Customer count by IntegrationType', async () => {
    await integrationFactory({ kind: '' });

    await graphqlRequest(qryCount, 'customerCounts', {
      only: 'byIntegrationType'
    });
  });

  test('Customer filtered by submitted form', async () => {
    await createGMock();

    const customer1 = await customerFactory({}, true);
    const customer2 = await customerFactory({}, true);

    const form = await formFactory({});

    await formSubmissionFactory({
      customerId: customer1._id,
      formId: form._id
    });
    await formSubmissionFactory({
      customerId: customer2._id,
      formId: form._id
    });

    await graphqlRequest(qryCustomersMain, 'customersMain', {
      form: form._id
    });

    gmock.restore();
  });

  test('Customer filtered by submitted form with startDcate and endDate', async () => {
    await createGMock();

    const customer = await customerFactory({}, true);
    const customer1 = await customerFactory({}, true);
    const customer2 = await customerFactory({}, true);

    const startDate = moment().format('YYYY-MM-DD HH:mm');
    const endDate = moment(startDate)
      .add(25, 'days')
      .format('YYYY-MM-DD HH:mm');

    const form = await formFactory();

    // Creating 3 submissions for form
    await formSubmissionFactory({ customerId: customer._id, formId: form._id });
    await formSubmissionFactory({
      customerId: customer1._id,
      formId: form._id
    });
    await formSubmissionFactory({
      customerId: customer2._id,
      formId: form._id
    });

    const args = {
      startDate,
      endDate,
      form: form._id
    };

    await graphqlRequest(qryCustomersMain, 'customersMain', args);

    gmock.restore();
  });

  test('Customer filtered by default selector', async () => {
    await createGMock();

    await integrationFactory({});
    await graphqlRequest(qryCustomersMain, 'customersMain', {});

    gmock.restore();
  });

  test('Customers by segment', async () => {
    await customerFactory({}, false, true);
    await customerFactory({}, false, true);
    await customerFactory(
      { firstName: 'batamar', leadStatus: 'new' },
      false,
      true
    );

    await sleep(2000);

    const subSegment = await segmentFactory({
      contentType: 'customer',
      conditions: [
        {
          type: 'property',
          propertyType: 'customer',
          propertyName: 'firstName',
          propertyOperator: 'c',
          propertyValue: 'bat'
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
          propertyName: 'leadStatus',
          propertyOperator: 'c',
          propertyValue: 'new'
        }
      ]
    });

    const response = await graphqlRequest(qryCustomersMain, 'customersMain', {
      segment: mainSegment._id
    });

    expect(response.list.length).toBe(1);
  });

  test('Customer detail', async () => {
    const customer = await customerFactory({ trackedData: { t1: 'v1' } }, true);
    const company = await companyFactory();
    const conformity = await conformityFactory({
      mainType: 'customer',
      mainTypeId: customer._id,
      relType: 'company',
      relTypeId: company._id
    });
    await conversationFactory({ customerId: customer._id });

    const mock = sinon.stub(elk, 'fetchElk').callsFake(({ index }) => {
      if (index === 'events') {
        return Promise.resolve({
          hits: {
            hits: [
              {
                _source: {
                  createdAt: new Date(),
                  count: 1,
                  attributes: [{ value: '/test' }]
                }
              }
            ]
          }
        });
      } else if (index === 'conformities') {
        return Promise.resolve({
          took: 0,
          timed_out: false,
          _shards: {
            total: 1,
            successful: 1,
            skipped: 0,
            failed: 0
          },
          hits: {
            total: {
              value: 1,
              relation: 'eq'
            },
            max_score: 10.735046,
            hits: [
              {
                _index: 'erxes__conformities',
                _type: '_doc',
                _id: conformity._id,
                _score: 10.735046,
                _source: {
                  mainType: 'customer',
                  mainTypeId: customer._id,
                  relType: 'company',
                  relTypeId: company._id,
                  __v: 0
                }
              }
            ]
          }
        });
      }
    });

    const qry = `
      query customerDetail($_id: String!) {
        customerDetail(_id: $_id) {
          _id
          createdAt
          modifiedAt
          integrationId
          firstName
          lastName
          primaryEmail
          emails
          primaryPhone
          phones
          tagIds
          remoteAddress
          internalNotes
          location
          visitorContactInfo
          customFieldsData
          trackedData
          ownerId
          position
          department
          leadStatus
          hasAuthority
          description
          isSubscribed
          links
          urlVisits
          conversations { _id }
          getTags { _id }
          owner { _id }
          integration { _id }
          companies { _id }
        }
      }
    `;

    const response = await graphqlRequest(qry, 'customerDetail', {
      _id: customer._id
    });

    mock.restore();

    expect(response._id).toBe(customer._id);
  });
});
