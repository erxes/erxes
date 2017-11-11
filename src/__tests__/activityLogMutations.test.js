/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import mutations from '../data/resolvers/mutations';
import { ROLES } from '../data/constants';
import ActivityLogs, { ACTIVITY_TYPES } from '../db/models/ActivityLogs';
import { userFactory, customerFactory } from '../db/factories';
import { COC_CONTENT_TYPES } from '../data/constants';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('ActivityLog creation on Customer creation', () => {
  afterEach(async () => {
    await ActivityLogs.remove({});
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
});
