/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import customerMutations from '../data/resolvers/mutations/customers';
import { ROLES } from '../data/constants';
import { ActivityLogs } from '../db/models';
import { userFactory } from '../db/factories';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('ActivityLog creation on Customer creation', () => {
  test(`createCompanyRegistrationLog`, async () => {
    const customerDoc = {
      name: 'Reggina',
    };

    const user = userFactory({ role: ROLES.CONTRIBUTOR });

    await customerMutations.customersAdd(null, customerDoc, { user });

    expect(await ActivityLogs.find({}).count()).toBe(1);
  });
});
