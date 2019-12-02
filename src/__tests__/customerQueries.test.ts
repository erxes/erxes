import * as faker from 'faker';
import * as moment from 'moment';
import { graphqlRequest } from '../db/connection';
import {
  brandFactory,
  customerFactory,
  formFactory,
  formSubmissionFactory,
  integrationFactory,
  segmentFactory,
  tagsFactory,
} from '../db/factories';
import { Customers, FormSubmissions, Segments, Tags } from '../db/models';

import { KIND_CHOICES } from '../db/models/definitions/constants';
import './setup.ts';

const count = response => {
  return Object.keys(response).length;
};

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
    $lifecycleState: String,
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
    lifecycleState: $lifecycleState
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
    query customerCounts(${commonParamDefs} $byFakeSegment: JSON, $only: String) {
      customerCounts(${commonParams} byFakeSegment: $byFakeSegment, only: $only)
    }
  `;

  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const primaryEmail = 'test@test.com';
  const primaryPhone = '12345678';

  afterEach(async () => {
    // Clearing test data
    await Customers.deleteMany({});
    await Segments.deleteMany({});
    await Tags.deleteMany({});
    await FormSubmissions.deleteMany({});
  });

  test('Customers', async () => {
    const integration = await integrationFactory();
    await customerFactory({ integrationId: integration._id }, true);
    await customerFactory({}, true);
    await customerFactory({}, true);

    const args = { page: 1, perPage: 3 };
    const responses = await graphqlRequest(qryCustomers, 'customers', args);

    expect(responses.length).toBe(3);
  });

  test('Customers filtered by ids', async () => {
    const customer1 = await customerFactory({}, true);
    const customer2 = await customerFactory({}, true);
    const customer3 = await customerFactory({}, true);

    await customerFactory({}, true);
    await customerFactory({}, true);
    await customerFactory({}, true);

    const ids = [customer1._id, customer2._id, customer3._id];

    const responses = await graphqlRequest(qryCustomers, 'customers', { ids });

    expect(responses.length).toBe(3);
  });

  test('Customers filtered by tag', async () => {
    const tag = await tagsFactory({});

    await customerFactory({}, true);
    await customerFactory({}, true);
    await customerFactory({ tagIds: [tag._id] }, true);
    await customerFactory({ tagIds: [tag._id] }, true);

    const tagResponse = await Tags.findOne({}, '_id');

    const responses = await graphqlRequest(qryCustomers, 'customers', {
      tag: tagResponse ? tagResponse._id : '',
    });

    expect(responses.length).toBe(2);
  });

  test('Customers filtered by leadStatus', async () => {
    await customerFactory({}, true);
    await customerFactory({}, true);
    await customerFactory({ leadStatus: 'new' }, true);
    await customerFactory({ leadStatus: 'new' }, true);

    const responses = await graphqlRequest(qryCustomers, 'customers', {
      leadStatus: 'new',
    });

    expect(responses.length).toBe(2);
  });

  test('Customers filtered by lifecycleState', async () => {
    await customerFactory({}, true);
    await customerFactory({}, true);
    await customerFactory({ lifecycleState: 'subscriber' }, true);
    await customerFactory({ lifecycleState: 'subscriber' }, true);

    const responses = await graphqlRequest(qryCustomers, 'customers', {
      lifecycleState: 'subscriber',
    });

    expect(responses.length).toBe(2);
  });

  test('Customers filtered by segment', async () => {
    await customerFactory({ firstName }, true);
    await customerFactory({}, true);

    const args = {
      contentType: 'customer',
      conditions: [
        {
          field: 'firstName',
          operator: 'c',
          value: firstName,
          type: 'string',
        },
      ],
    };

    const segment = await segmentFactory(args);

    const response = await graphqlRequest(qryCustomers, 'customers', {
      segment: segment._id,
    });

    expect(response.length).toBe(1);
  });

  test('Customers filtered by search value', async () => {
    await customerFactory({ firstName: 'firstName' }, true);
    await customerFactory({ lastName: 'lastName' }, true);
    await customerFactory({ primaryPhone, phones: [primaryPhone] }, true);
    await customerFactory({ primaryEmail, emails: [primaryEmail] }, true);

    // customers by firstName ==============
    let responses = await graphqlRequest(qryCustomers, 'customers', {
      searchValue: 'firstName',
    });

    expect(responses.length).toBe(1);

    // customers by lastName ===========
    responses = await graphqlRequest(qryCustomers, 'customers', {
      searchValue: 'lastName',
    });

    expect(responses.length).toBe(1);

    // customers by email ==========
    responses = await graphqlRequest(qryCustomers, 'customers', {
      searchValue: primaryEmail,
    });

    expect(responses.length).toBe(1);

    // customers by phone ==============
    responses = await graphqlRequest(qryCustomers, 'customers', {
      searchValue: primaryPhone,
    });

    expect(responses.length).toBe(1);

    // customer by contains name
    responses = await graphqlRequest(qryCustomers, 'customers', {
      searchValue: 'sname',
    });

    expect(responses.length).toBe(2);
  });

  test('Main customers', async () => {
    await customerFactory({}, true);
    await customerFactory({}, true);
    await customerFactory({}, true);
    await customerFactory({}, true);

    const args = { page: 1, perPage: 3 };
    const responses = await graphqlRequest(qryCustomersMain, 'customersMain', args);

    expect(responses.list.length).toBe(3);
    expect(responses.totalCount).toBe(4);
  });

  test('Count customers', async () => {
    const customer1 = await customerFactory({}, true);
    const customer2 = await customerFactory({}, true);
    const customer3 = await customerFactory({}, true);

    // Creating test data
    await segmentFactory({ contentType: 'customer' });

    const args = { only: 'bySegment', ids: [customer1._id, customer2._id, customer3._id] };

    const response = await graphqlRequest(qryCount, 'customerCounts', args);

    expect(count(response.bySegment)).toBe(1);
  });

  test('Count customers by segment', async () => {
    await customerFactory({}, true);
    await customerFactory({}, true);

    // Creating test data
    await segmentFactory({ contentType: 'customer' });

    const args = { only: 'bySegment' };

    const response = await graphqlRequest(qryCount, 'customerCounts', args);

    expect(count(response.bySegment)).toBe(1);
  });

  test('Count companies by segment', async () => {
    // Creating test data
    await customerFactory({});
    await customerFactory({});

    await segmentFactory({ contentType: 'customer' });

    let response = await graphqlRequest(qryCount, 'customerCounts', {
      only: 'bySegment',
    });

    expect(count(response.bySegment)).toBe(1);

    const args: any = {
      contentType: 'customer',
      conditions: [
        {
          field: 'primaryName',
          operator: 'c',
          value: 'name',
          type: 'date',
        },
      ],
    };

    await segmentFactory(args);

    try {
      response = await graphqlRequest(qryCount, 'customerCounts', {
        only: 'bySegment',
      });
    } catch (e) {
      expect(e[0].message).toBe('TypeError: str.replace is not a function');
    }
  });

  test('Customer count by segment (CastError)', async () => {
    await customerFactory({});
    await customerFactory({});

    const args = {
      contentType: 'customer',
      conditions: [
        {
          field: 'profileScore',
          operator: 'igt',
          value: 'name',
          type: 'string',
        },
      ],
    };

    const segment = await segmentFactory(args);

    const response = await graphqlRequest(qryCount, 'customerCounts', {
      only: 'bySegment',
    });

    expect(response.bySegment[segment._id]).toBe(0);
  });

  test('Count customers by brand', async () => {
    const brand = await brandFactory({});

    await customerFactory({}, true);
    await customerFactory({}, true);

    // Creating test data
    await segmentFactory({ contentType: 'customer' });

    const response = await graphqlRequest(qryCount, 'customerCounts', {
      only: 'byBrand',
    });

    expect(response.byBrand[brand._id]).toBe(0);
  });

  test('Customer count by tag', async () => {
    await customerFactory({}, true);
    await customerFactory({}, true);

    await tagsFactory({ type: 'company' });
    await tagsFactory({ type: 'customer' });

    const response = await graphqlRequest(qryCount, 'customerCounts', {
      only: 'byTag',
    });

    expect(count(response.byTag)).toBe(1);
  });

  test('Customer count by fake segment', async () => {
    await customerFactory({ lastName }, true);

    const byFakeSegment = {
      contentType: 'customer',
      conditions: [
        {
          field: 'lastName',
          operator: 'c',
          value: lastName,
          type: 'string',
        },
      ],
    };

    const response = await graphqlRequest(qryCount, 'customerCounts', {
      byFakeSegment,
    });

    expect(response.byFakeSegment).toBe(1);
  });

  test('Customer count by form', async () => {
    const form = await formFactory({});

    await customerFactory({}, true);
    await customerFactory({}, true);
    await customerFactory({}, true);
    await customerFactory({}, true);

    const response = await graphqlRequest(qryCount, 'customerCounts', {
      only: 'byForm',
    });

    expect(response.byForm[form._id]).toBe(0);
  });

  test('Customer count by leadStatus', async () => {
    await customerFactory({}, true);
    await customerFactory({}, true);
    await customerFactory({ leadStatus: 'new' }, true);
    await customerFactory({ leadStatus: 'new' }, true);

    const response = await graphqlRequest(qryCount, 'customerCounts', {
      only: 'byLeadStatus',
    });

    expect(response.byLeadStatus.open).toBe(2);
    expect(response.byLeadStatus.new).toBe(2);
  });

  test('Customer count by lifecycleState', async () => {
    await customerFactory({}, true);
    await customerFactory({}, true);
    await customerFactory({ lifecycleState: 'subscriber' }, true);
    await customerFactory({ lifecycleState: 'subscriber' }, true);

    const response = await graphqlRequest(qryCount, 'customerCounts', {
      only: 'byLifecycleState',
    });

    expect(response.byLifecycleState.subscriber).toBe(2);
    expect(response.byLifecycleState.lead).toBe(2);
  });

  test('Customer count by IntegrationType', async () => {
    const messengerIntegration = await integrationFactory({ kind: KIND_CHOICES.MESSENGER });
    const integration = await integrationFactory({ kind: '' });

    await customerFactory({ integrationId: messengerIntegration._id });
    await customerFactory({ integrationId: messengerIntegration._id });
    await customerFactory({ integrationId: integration._id });
    await customerFactory({ integrationId: integration._id });

    const response = await graphqlRequest(qryCount, 'customerCounts', {
      only: 'byIntegrationType',
    });

    expect(response.byIntegrationType.messenger).toBe(0);
  });

  test('Customer filtered by submitted form', async () => {
    const customer1 = await customerFactory({}, true);
    const customer2 = await customerFactory({}, true);
    const form = await formFactory({});

    await formSubmissionFactory({ customerId: customer1._id, formId: form._id });
    await formSubmissionFactory({ customerId: customer2._id, formId: form._id });

    const responses = await graphqlRequest(qryCustomersMain, 'customersMain', {
      form: form._id,
    });

    expect(responses.list.length).toBe(2);
  });

  test('Customer filtered by submitted form with startDate and endDate', async () => {
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
    await formSubmissionFactory({ customerId: customer1._id, formId: form._id });
    await formSubmissionFactory({ customerId: customer2._id, formId: form._id });

    const args = {
      startDate,
      endDate,
      form: form._id,
    };

    const responses = await graphqlRequest(qryCustomersMain, 'customersMain', args);

    expect(responses.list.length).toBe(3);
  });

  test('Customer filtered by default selector', async () => {
    const integration = await integrationFactory({});
    await Customers.createCustomer({ integrationId: integration._id });
    await customerFactory({}, true);
    await customerFactory({}, true);

    const responses = await graphqlRequest(qryCustomersMain, 'customersMain', {});

    expect(responses.list.length).toBe(2);
  });

  test('Customer list for segment preview', async () => {
    const headSegment = await segmentFactory({});
    const segment = await segmentFactory({ subOf: headSegment._id });

    const messengerData = { sessionCount: 10 };

    await customerFactory({ messengerData });
    await customerFactory();

    const qry = `
      query customerListForSegmentPreview($segment: JSON, $limit: Int) {
        customerListForSegmentPreview(segment: $segment, limit: $limit) {
          _id
        }
      }
    `;

    const args = { segment };

    const responses = await graphqlRequest(qry, 'customerListForSegmentPreview', args);

    expect(responses.length).toBe(1);
  });

  test('Customer detail', async () => {
    const customer = await customerFactory({}, true);
    const customerWithCustomData = await customerFactory({ messengerData: { customData: { data: 'data' } } });
    const customerNoMessengerData = await customerFactory();

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
          isUser
          tagIds
          remoteAddress
          internalNotes
          location
          visitorContactInfo
          customFieldsData
          messengerData
          ownerId
          position
          department
          leadStatus
          lifecycleState
          hasAuthority
          description
          doNotDisturb
          links {
            linkedIn
            twitter
            facebook
            youtube
            github
            website
          }
          conversations { _id }
          getIntegrationData
          getMessengerCustomData
          getTags { _id }
          owner { _id }
          integration { _id }
          companies { _id }
        }
      }
    `;

    let response = await graphqlRequest(qry, 'customerDetail', {
      _id: customer._id,
    });

    expect(response._id).toBe(customer._id);

    response = await graphqlRequest(qry, 'customerDetail', {
      _id: customerWithCustomData._id,
    });

    expect(response._id).toBe(customerWithCustomData._id);

    response = await graphqlRequest(qry, 'customerDetail', {
      _id: customerNoMessengerData._id,
    });

    expect(response._id).toBe(customerNoMessengerData._id);
  });
});
