/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import mutations from '../data/resolvers/mutations';
import {
  ROLES,
  ACTIVITY_TYPES,
  ACTIVITY_ACTIONS,
  COC_CONTENT_TYPES,
  ACTIVITY_PERFORMER_TYPES,
} from '../data/constants';
import { ActivityLogs, Customers, Companies } from '../db/models';
import { userFactory, customerFactory } from '../db/factories';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('ActivityLog creation on Customer creation', () => {
  afterEach(async () => {
    await ActivityLogs.remove({});
    await Customers.remove({});
    await Companies.remove({});
  });

  test(`createCompanyRegistrationLog`, async () => {
    const customerDoc = {
      name: 'Reggina',
    };

    const user = await userFactory({ role: ROLES.CONTRIBUTOR });

    const customer = await mutations.customersAdd(null, customerDoc, { user });

    expect(await ActivityLogs.find().count()).toBe(1);
    const aLog = await ActivityLogs.findOne({});
    expect(aLog).toBeDefined();

    expect(aLog.activity.type).toBe(COC_CONTENT_TYPES.CUSTOMER);
    expect(aLog.activity.id).toBe(customer._id);
    expect(aLog.coc.type).toBe(COC_CONTENT_TYPES.CUSTOMER);
    expect(aLog.coc.id).toBe(customer._id);
  });

  test(`createCompanyRegistrationLog`, async () => {
    const customer = await customerFactory({});

    const addCompanyDoc = {
      _id: customer._id,
      name: 'Reggina',
      website: 'http://www.test.com',
    };

    const user = await userFactory({ role: ROLES.CONTRIBUTOR });

    const company = await mutations.customersAddCompany(null, addCompanyDoc, { user });

    expect(await ActivityLogs.find().count()).toBe(1);
    const aLog = await ActivityLogs.findOne({});
    expect(aLog).toBeDefined();

    expect(aLog.activity.type).toBe(COC_CONTENT_TYPES.COMPANY);
    expect(aLog.activity.id).toBe(company._id);
    expect(aLog.coc.type).toBe(COC_CONTENT_TYPES.COMPANY);
    expect(aLog.coc.id).toBe(company._id);
  });

  test(`createInternalNote`, async () => {
    const user = await userFactory({ role: ROLES.CONTRIBUTOR });
    const customer = await customerFactory({});

    const internalNote = await mutations.internalNotesAdd(
      null,
      {
        contentType: COC_CONTENT_TYPES.CUSTOMER,
        contentTypeId: customer._id,
        content: 'test string',
      },
      { user },
    );

    expect(await ActivityLogs.find().count()).toBe(1);

    const aLog = await ActivityLogs.findOne({});

    expect(aLog).toBeDefined();
    expect(aLog.activity.type).toBe(ACTIVITY_TYPES.INTERNAL_NOTE);
    expect(aLog.activity.id).toBe(internalNote._id);
    expect(aLog.coc.type).toBe(COC_CONTENT_TYPES.CUSTOMER);
    expect(aLog.coc.id).toBe(customer._id);
  });

  test(`activityLogsAddCustomerLog`, async () => {
    const customerDoc = await customerFactory();

    Customers.findOne = jest.fn(() => customerDoc);

    const aLog = await mutations.activityLogsAddCustomerLog(null, { _id: customerDoc._id });

    expect(aLog.activity.toObject()).toEqual({
      type: ACTIVITY_TYPES.CUSTOMER,
      action: ACTIVITY_ACTIONS.CREATE,
      id: customerDoc._id,
      content: customerDoc.getFullName(),
    });
    expect(aLog.coc.toObject()).toEqual({
      type: COC_CONTENT_TYPES.CUSTOMER,
      id: customerDoc._id,
    });
    expect(aLog.performedBy.toObject()).toEqual({
      type: ACTIVITY_PERFORMER_TYPES.SYSTEM,
    });
  });

  test(`activityLogsAddCompanyLog`, async () => {
    const companyDoc = { _id: 'testCompanyId', name: 'test company' };

    Companies.findOne = jest.fn(() => companyDoc);

    const aLog = await mutations.activityLogsAddCompanyLog(null, { _id: companyDoc._id });

    expect(aLog.activity.toObject()).toEqual({
      type: ACTIVITY_TYPES.COMPANY,
      action: ACTIVITY_ACTIONS.CREATE,
      content: companyDoc.name,
      id: companyDoc._id,
    });
    expect(aLog.coc.toObject()).toEqual({
      type: COC_CONTENT_TYPES.COMPANY,
      id: companyDoc._id,
    });
    expect(aLog.performedBy.toObject()).toEqual({
      type: ACTIVITY_PERFORMER_TYPES.SYSTEM,
    });
  });
});
