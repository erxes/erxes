import * as faker from 'faker';
import * as sinon from 'sinon';
import * as utils from '../data/utils';
import { graphqlRequest } from '../db/connection';
import {
  customerFactory,
  integrationFactory,
  userFactory
} from '../db/factories';
import { Brands, Customers, Integrations, Users } from '../db/models';
import './setup.ts';

/*
 * Generate test data
 */
const args = {
  firstName: faker.name.findName(),
  lastName: faker.name.findName(),
  primaryEmail: faker.internet.email(),
  emails: [faker.internet.email()],
  primaryPhone: faker.phone.phoneNumber(),
  phones: [faker.internet.email()],
  ownerId: faker.random.word(),
  position: faker.random.word(),
  department: faker.random.word(),
  leadStatus: 'new',
  hasAuthority: 'No',
  description: faker.random.word(),
  doNotDisturb: 'Yes',
  links: {
    linkedIn: 'linkedIn',
    twitter: 'twitter',
    facebook: 'facebook',
    youtube: 'youtube',
    github: 'github',
    website: 'website'
  }
};

const checkCustomer = src => {
  expect(src.firstName).toBe(args.firstName);
  expect(src.lastName).toBe(args.lastName);
  expect(src.primaryEmail).toBe(args.primaryEmail);
  expect(src.emails).toEqual(expect.arrayContaining(args.emails));
  expect(src.primaryPhone).toBe(args.primaryPhone);
  expect(src.phones).toEqual(expect.arrayContaining(args.phones));
  expect(src.ownerId).toBe(args.ownerId);
  expect(src.position).toBe(args.position);
  expect(src.department).toBe(args.department);
  expect(src.leadStatus).toBe(args.leadStatus);
  expect(src.hasAuthority).toBe(args.hasAuthority);
  expect(src.description).toBe(args.description);
  expect(src.doNotDisturb).toBe(args.doNotDisturb);
  expect(src.links).toEqual(args.links);
};

describe('Customers mutations', () => {
  let _user;
  let _customer;
  let context;
  let integration;

  const commonParamDefs = `
    $firstName: String
    $lastName: String
    $primaryEmail: String
    $emails: [String]
    $primaryPhone: String
    $phones: [String]
    $ownerId: String
    $position: String
    $department: String
    $leadStatus: String
    $hasAuthority: String
    $description: String
    $doNotDisturb: String
    $links: JSON
    $customFieldsData: JSON
  `;

  const commonParams = `
    firstName: $firstName
    lastName: $lastName
    primaryEmail: $primaryEmail
    emails: $emails
    primaryPhone: $primaryPhone
    phones: $phones
    ownerId: $ownerId
    position: $position
    department: $department
    leadStatus: $leadStatus
    hasAuthority: $hasAuthority
    description: $description
    doNotDisturb: $doNotDisturb
    links: $links
    customFieldsData: $customFieldsData
  `;

  beforeEach(async () => {
    // Creating test data
    integration = await integrationFactory();
    _user = await userFactory({});
    _customer = await customerFactory({ integrationId: integration._id });

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Users.deleteMany({});
    await Customers.deleteMany({});
    await Brands.deleteMany({});
    await Integrations.deleteMany({});
  });

  test('Add customer', async () => {
    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve('success');
    });

    const mutation = `
      mutation customersAdd(${commonParamDefs}){
        customersAdd(${commonParams}) {
          firstName
          lastName
          primaryEmail
          emails
          primaryPhone
          phones
          ownerId
          position
          department
          leadStatus
          hasAuthority
          description
          doNotDisturb
          links
          customFieldsData
        }
      }
    `;

    const customer = await graphqlRequest(
      mutation,
      'customersAdd',
      args,
      context
    );

    checkCustomer(customer);
    expect(customer.emailValidationStatus).toBe(undefined);
    expect(customer.phoneValidationStatus).toBe(undefined);
    expect(customer.customFieldsData.length).toEqual(0);

    mock.restore();
  });

  test('Edit customer', async () => {
    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve('success');
    });

    const mutation = `
      mutation customersEdit($_id: String! ${commonParamDefs}){
        customersEdit(_id: $_id ${commonParams}) {
          _id
          firstName
          lastName
          primaryEmail
          emails
          primaryPhone
          phones
          ownerId
          position
          department
          leadStatus
          hasAuthority
          description
          doNotDisturb
          links
          customFieldsData
        }
      }
    `;

    const customer = await graphqlRequest(
      mutation,
      'customersEdit',
      { _id: _customer._id, ...args },
      context
    );

    expect(customer._id).toBe(_customer._id);
    expect(customer.emailValidationStatus).toBe(undefined);
    expect(customer.phoneValidationStatus).toBe(undefined);

    checkCustomer(customer);
    expect(customer.customFieldsData.length).toEqual(0);
    mock.restore();
  });

  test('Remove customer', async () => {
    const mutation = `
      mutation customersRemove($customerIds: [String]) {
        customersRemove(customerIds: $customerIds)
      }
    `;

    await graphqlRequest(
      mutation,
      'customersRemove',
      { customerIds: [_customer._id] },
      context
    );

    expect(await Customers.find({ _id: { $in: [_customer._id] } })).toEqual([]);
  });

  test('Merge customer', async () => {
    const params = {
      customerIds: [_customer._id],
      customerFields: {
        firstName: faker.name.firstName()
      }
    };

    const mutation = `
      mutation customersMerge($customerIds: [String] $customerFields: JSON) {
        customersMerge(customerIds: $customerIds customerFields: $customerFields) {
          firstName
        }
      }
    `;

    const customer = await graphqlRequest(
      mutation,
      'customersMerge',
      params,
      context
    );

    expect(customer.firstName).toBe(params.customerFields.firstName);
  });

  test('Change state', async () => {
    const mutation = `
      mutation customersChangeState($_id: String!, $value: String!) {
        customersChangeState(_id: $_id, value: $value) {
          _id
          state
        }
      }
    `;

    await graphqlRequest(
      mutation,
      'customersChangeState',
      { _id: _customer._id, value: 'customer' },
      context
    );

    const updatedCustomer = await Customers.getCustomer(_customer._id);

    expect(updatedCustomer.state).toBe('customer');
  });

  test('Verify emails', async () => {
    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve('success');
    });

    const mutation = `
      mutation customersVerify($verificationType: String!) {
        customersVerify(verificationType: $verificationType)
      }
    `;

    await graphqlRequest(
      mutation,
      'customersVerify',
      { verificationType: 'email' },
      context
    );

    mock.restore();
  });

  test('Change verification status', async () => {
    const mutation = `
      mutation customersChangeVerificationStatus($customerIds: [String], $type: String!, $status: String!) {
        customersChangeVerificationStatus(customerIds: $customerIds, type: $type, status: $status) {
          _id
          state
          emailValidationStatus
          phoneValidationStatus
        }
      }
    `;

    await graphqlRequest(
      mutation,
      'customersChangeVerificationStatus',
      { customerIds: [_customer._id], type: 'email', status: 'valid' },
      context
    );

    const updatedCustomers = await Customers.find({
      _id: { $in: [_customer._id] }
    });
    updatedCustomers.forEach(c => {
      expect(c.emailValidationStatus).toBe('valid');
    });
  });
});
