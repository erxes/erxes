import * as faker from 'faker';
import { connect, disconnect, graphqlRequest } from '../db/connection';
import { customerFactory, userFactory } from '../db/factories';
import { Customers, Users } from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

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
  leadStatus: 'open',
  lifecycleState: 'lead',
  hasAuthority: faker.random.word(),
  description: faker.random.word(),
  doNotDisturb: faker.random.word(),
  links: {
    linkedIn: 'linkedIn',
    twitter: 'twitter',
    facebook: 'facebook',
    youtube: 'youtube',
    github: 'github',
    website: 'website',
  },
  customFieldsData: {},
};

describe('Customers mutations', () => {
  let _user;
  let _customer;
  let context;

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
    $lifecycleState:  String
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
    lifecycleState: $lifecycleState
    hasAuthority: $hasAuthority
    description: $description
    doNotDisturb: $doNotDisturb
    links: $links
    customFieldsData: $customFieldsData
  `;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({});
    _customer = await customerFactory({});

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
    await Customers.remove({});
  });

  test('Add customer', async () => {
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
          customFieldsData
        }
      }
    `;

    const customer = await graphqlRequest(mutation, 'customersAdd', args, context);

    expect(customer.firstName).toBe(args.firstName);
    expect(customer.lastName).toBe(args.lastName);
    expect(customer.primaryEmail).toBe(args.primaryEmail);
    expect(customer.emails).toEqual(expect.arrayContaining(args.emails));
    expect(customer.primaryPhone).toBe(args.primaryPhone);
    expect(customer.phones).toEqual(expect.arrayContaining(args.phones));
    expect(customer.ownerId).toBe(args.ownerId);
    expect(customer.position).toBe(args.position);
    expect(customer.department).toBe(args.department);
    expect(customer.leadStatus).toBe(args.leadStatus);
    expect(customer.lifecycleState).toBe(args.lifecycleState);
    expect(customer.hasAuthority).toBe(args.hasAuthority);
    expect(customer.description).toBe(args.description);
    expect(customer.doNotDisturb).toBe(args.doNotDisturb);
    expect(customer.links).toEqual(args.links);
    expect(customer.customFieldsData).toEqual(args.customFieldsData);
  });

  test('Edit customer', async () => {
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
          customFieldsData
        }
      }
    `;

    const customer = await graphqlRequest(mutation, 'customersEdit', { _id: _customer._id, ...args }, context);

    expect(customer._id).toBe(_customer._id);
    expect(customer.firstName).toBe(args.firstName);
    expect(customer.lastName).toBe(args.lastName);
    expect(customer.primaryEmail).toBe(args.primaryEmail);
    expect(customer.emails).toEqual(expect.arrayContaining(args.emails));
    expect(customer.primaryPhone).toBe(args.primaryPhone);
    expect(customer.phones).toEqual(expect.arrayContaining(args.phones));
    expect(customer.ownerId).toBe(args.ownerId);
    expect(customer.position).toBe(args.position);
    expect(customer.department).toBe(args.department);
    expect(customer.leadStatus).toBe(args.leadStatus);
    expect(customer.lifecycleState).toBe(args.lifecycleState);
    expect(customer.hasAuthority).toBe(args.hasAuthority);
    expect(customer.description).toBe(args.description);
    expect(customer.doNotDisturb).toBe(args.doNotDisturb);
    expect(customer.links).toEqual(args.links);
    expect(customer.customFieldsData).toBe(null);
  });

  test('Edit company of customer', async () => {
    const params = {
      _id: _customer._id,
      companyIds: [faker.random.uuid()],
    };

    const mutation = `
      mutation customersEditCompanies($_id: String! $companyIds: [String]) {
        customersEditCompanies(_id: $_id companyIds: $companyIds) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'customersEditCompanies', params, context);

    const customer = await Customers.findOne({ _id: params._id });

    if (!customer) {
      throw new Error('Customer not found');
    }

    expect(customer.companyIds).toContain(params.companyIds);
  });

  test('Remove customer', async () => {
    const mutation = `
      mutation customersRemove($customerIds: [String]) {
        customersRemove(customerIds: $customerIds)
      }
    `;

    await graphqlRequest(mutation, 'customersRemove', { customerIds: [_customer._id] }, context);

    expect(await Customers.find({ _id: { $in: [_customer._id] } })).toEqual([]);
  });

  test('Merge customer', async () => {
    const params = {
      customerIds: [_customer._id],
      customerFields: {
        firstName: faker.name.firstName(),
      },
    };

    const mutation = `
      mutation customersMerge($customerIds: [String] $customerFields: JSON) {
        customersMerge(customerIds: $customerIds customerFields: $customerFields) {
          firstName
        }
      }
    `;

    const customer = await graphqlRequest(mutation, 'customersMerge', params, context);

    expect(customer.firstName).toBe(params.customerFields.firstName);
  });
});
