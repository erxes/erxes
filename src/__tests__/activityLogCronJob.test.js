/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import cronJobs from '../cronJobs';
import { CUSTOMER_CONTENT_TYPES } from '../data/constants';
import { customerFactory, segmentFactory } from '../db/factories';
import ActivityLogs, {
  ACTIVITY_TYPES,
  ACTIVITY_ACTIONS,
  ACTION_PERFORMER_TYPES,
} from '../db/models/ActivityLogs';
import { Customers } from '../db/models';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('test activityLogsCronJob', () => {
  test('test if it is working as intended', async () => {
    const nameEqualsConditions = [
      {
        type: 'string',
        dateUnit: 'days',
        value: 'John Smith',
        operator: 'e',
        field: 'name',
      },
    ];

    const customer = await customerFactory({ name: 'john smith' });
    const segment = await segmentFactory({
      contentType: CUSTOMER_CONTENT_TYPES.CUSTOMER,
      conditions: nameEqualsConditions,
    });

    await cronJobs.createActivityLogsFromSegments();

    expect(await ActivityLogs.find().count()).toBe(1);

    const aLog = await ActivityLogs.findOne();

    expect(aLog.activity.toObject()).toEqual({
      type: ACTIVITY_TYPES.SEGMENT,
      action: ACTIVITY_ACTIONS.CREATE,
      content: {
        name: segment.name,
      },
      id: segment._id,
    });
    expect(aLog.customer.toObject()).toEqual({
      type: CUSTOMER_CONTENT_TYPES.CUSTOMER,
      id: customer._id,
    });
    expect(aLog.performedBy.toObject()).toEqual({
      type: ACTION_PERFORMER_TYPES.SYSTEM,
    });

    await Customers.updateCustomer(customer._id, { name: 'jane smith' });

    await cronJobs.createActivityLogsFromSegments();

    expect(await ActivityLogs.find().count()).toBe(1);
  });
});
