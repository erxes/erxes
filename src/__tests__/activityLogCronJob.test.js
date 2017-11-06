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

beforeAll(() => connect());
afterAll(() => disconnect());

describe('test activityLogsCronJob', () => {
  test('1', async () => {
    const nameEqualsConditions = [
      {
        type: 'string',
        dateUnit: 'days',
        value: 'John Smith',
        operator: 'e',
        field: 'name',
      },
    ];

    const customer = await customerFactory({ name: 'John Smith' });
    const segment = await segmentFactory({
      contentType: CUSTOMER_CONTENT_TYPES.CUSTOMER,
      conditions: nameEqualsConditions,
    });

    await cronJobs.createActivityLogsFromSegments();

    const aLog = await ActivityLogs.findOne();
    expect(aLog.activity.toObject()).toEqual({
      type: ACTIVITY_TYPES.SEGMENT,
      action: ACTIVITY_ACTIONS.CREATE,
      id: segment._id,
    });
    expect(aLog.customer.toObject()).toEqual({
      type: CUSTOMER_CONTENT_TYPES.CUSTOMER,
      id: customer._id,
    });
    expect(aLog.performedBy.toObject()).toEqual({
      type: ACTION_PERFORMER_TYPES.SYSTEM,
    });
  });
});
