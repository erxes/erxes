/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import cronJobs from '../cronJobs';
import { COC_CONTENT_TYPES } from '../data/constants';
import { customerFactory, segmentFactory } from '../db/factories';
import ActivityLogs, {
  ACTIVITY_TYPES,
  ACTIVITY_ACTIONS,
  ACTION_PERFORMER_TYPES,
} from '../db/models/ActivityLogs';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('test activityLogsCronJob', () => {
  test('test if it is working as intended', async () => {
    // check if the activity log is being created ==================
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
      contentType: COC_CONTENT_TYPES.CUSTOMER,
      conditions: nameEqualsConditions,
    });

    await cronJobs.createActivityLogsFromSegments();

    expect(await ActivityLogs.find().count()).toBe(1);

    const aLog = await ActivityLogs.findOne();

    expect(aLog.activity.toObject()).toEqual({
      type: ACTIVITY_TYPES.SEGMENT,
      action: ACTIVITY_ACTIONS.CREATE,
      content: segment.name,
      id: segment._id,
    });
    expect(aLog.coc.toObject()).toEqual({
      type: COC_CONTENT_TYPES.CUSTOMER,
      id: customer._id,
    });
    expect(aLog.performedBy.toObject()).toEqual({
      type: ACTION_PERFORMER_TYPES.SYSTEM,
    });

    // check if the second activity log is being created
    // also check if the duplicate activity log is
    // not being created for the former customer ================
    const nameEqualsConditions2 = [
      {
        type: 'string',
        dateUnit: 'days',
        value: 'jane smith',
        operator: 'e',
        field: 'name',
      },
    ];

    await customerFactory({ name: 'jane smith' });
    await segmentFactory({
      contentType: COC_CONTENT_TYPES.CUSTOMER,
      conditions: nameEqualsConditions2,
    });

    await cronJobs.createActivityLogsFromSegments();

    expect(await ActivityLogs.find().count()).toBe(2);
  });
});
